# dev 배포 자동화 워크플로우 설계

작성일: 2026-08-15
상태: 설계 확정 대기 (구현 전)

## 목표

`sandbox/*` 브랜치 push 시 Android·iOS 앱을 자동 빌드하여 **Firebase App Distribution(dev 프로젝트)** 으로 배포하고, 커밋 로그에서 출시 노트를 만들어 **Discord 알림**까지 자동화한다.

production 프로젝트용 워크플로우는 범위 외 (추후 별도 구성).

## 트리거 / 동시성

- `push` : `sandbox/**` 브랜치
- 브랜치명 `sandbox/<version>`의 `<version>`이 배포 버전의 단일 소스
- concurrency: 브랜치 단위 그룹, `cancel-in-progress: true` (연속 push 시 이전 실행 취소)

## 잡 구성

```
[1] version → [2] release-notes → ([3] android ∥ [4] ios) → [5] distribute-notify
```

### [1] version — 버전 검증·자동 커밋

1. 브랜치명에서 `X.Y.Z` 추출. **semver 정규식(`^\d+\.\d+\.\d+$`) 불일치 시 워크플로우 명시적 실패** (에러 메시지에 올바른 브랜치 네이밍 안내)
2. `package.json` version과 비교:
   - 동일 → 스킵
   - 다름 → `package.json` 버전 갱신 + `npx react-native-version`으로 네이티브(iOS/Android) 버전 반영
3. 기존 커밋 관례를 재현해 2커밋 자동 생성 후 push:
   - `chore: native version 업데이트(X.Y.Z)`
   - `X.Y.Z`
4. push는 **기본 `GITHUB_TOKEN`** 사용 — GitHub이 자체 재트리거를 차단하므로 무한 루프 없음. PAT 사용 금지.
5. 최종 커밋 SHA를 잡 output으로 내보내고, **이후 모든 잡([2]~[5])은 트리거 시점 SHA가 아니라 이 SHA를 체크아웃**한다 (버전 커밋이 포함된 상태로 빌드·노트 수집).

### [2] release-notes — 커밋 로그에서 출시 노트 생성

외부 API를 쓰지 않는다(비용·키 관리 부담을 피하고 결과를 결정적으로 유지).

- **수집 범위**: 직전 `dist-dev/*` 태그 이후 커밋. 태그가 없으면(첫 배포) 직전 버전 커밋(`X.Y.Z` 패턴) 이후. **버전 커밋 2종만 제외하고 전부 포함.**
- **그룹핑**: `개선`(feat/perf/style/refactor) / `버그 수정`(fix) / `기타`(그 외 전부). 제목은 `[TAS-123]feat(scope)!:` 형태까지 인식하며, 어느 그룹에도 안 걸린 제목은 `기타`가 거둬가 유실되지 않는다.
- **사용자 문체가 필요하면** 커밋 본문에 트레일러를 쓴다 — 스크립트가 그 문장을 그대로 싣는다:
  - `Release-Note: 알림 화면에서 아래로 당겨 새로고침할 수 있어요` → 항목(`•`)
  - `Release-Note-Detail: 알림 리스트·빈 상태에 PTR 추가` → 하위 항목(`-`), 여러 줄 가능
  - 트레일러가 없으면 타입을 뗀 커밋 제목이 항목이 된다
- 출력은 artifact로 [5]에 전달

### [3] android — 빌드 (ubuntu 러너)

- Node: `.nvmrc`(22.16.0) + yarn 캐시, JDK 17 + gradle 캐시
- 시크릿 복원: `.env`(`ENABLE_DEVTOOLS=true` 고정, `PACKAGE_VERSION`은 브랜치 버전으로 동기화), `android/app/google-services.json`(dev 프로젝트용)
- `./gradlew assembleRelease` — 현재 release가 debug keystore 서명이므로 dev 배포엔 추가 서명 시크릿 불필요 (production 워크플로우 시 반드시 정식 keystore로 정리)
- APK artifact 업로드

### [4] ios — 빌드 (macOS 러너)

- Apple Development 인증서(.p12)를 임시 키체인에 로드
- **프로비저닝 프로파일은 시크릿으로 전달**(로컬 맥의 것을 tar+base64) 후 러너에 설치. ASC API 키 발급(Admin 권한 필요)이라는 선행 작업을 없애기 위한 선택으로, 대신 테스터 UDID 추가·프로파일 만료 시 시크릿을 수동 갱신해야 한다. 갱신 빈도가 늘면 ASC 키 방식으로 전환
- export는 `signingStyle: manual` + 번들 ID→프로파일 이름 매핑으로 결정적 서명 (러너에 개발자 계정 로그인이 없으므로)
- 러너는 `macos-15`, Xcode는 로컬(16.2)에 맞춰 선택
- `bundle exec pod install` (Gemfile 기반)
- 시크릿 복원: `.env`, `ios/GoogleService-Info.plist`(dev 프로젝트용 — pbxproj가 참조하는 실제 경로)
- `xcodebuild archive` → **development export**로 IPA 생성 (`ios/ExportOptions-ci.plist`). 현재 팀에 배포(Distribution) 인증서가 없고 기존 테스트 배포도 development 서명으로 운영해 왔으며, ad-hoc으로 바꾸면 `aps-environment: development` 엔타이틀먼트와 어긋나 푸시가 깨질 수 있어 현행 방식을 유지한다
- IPA artifact 업로드

### [5] distribute-notify — 배포·태그·알림

- `needs: [android, ios]`, `if: always()`로 실행해 실패도 알림
- **배포**: firebase-tools CLI `appdistribution:distribute` — 서비스 계정 인증, 플랫폼별 App ID, **테스터 그룹 고정값**(Firebase 콘솔의 그룹 별칭), 출시 노트 첨부
- **태그**: 성공 시 `dist-dev/X.Y.Z-<run_number>` push (다음 배포의 노트 수집 기준점)
- **Discord**: webhook curl (본문 방식 — `@here` 멘션이 embed에서 동작하지 않으므로)
  - 성공: `@here` + 📱 버전 머리말 + AOS/iOS + 출시 노트 코드블록
  - 실패: 실패한 잡·run 링크 (조용한 실패 방지)
- **알림 실패는 잡을 실패시키지 않는다** — 이 시점엔 배포·태그가 끝나 되돌릴 수 없어, 빨간 런이 "배포 실패"로 오인되기 때문. 대신 `::warning::`으로 남긴다

## GitHub Secrets / Vars

| 이름                                              | 내용                                        |
| ------------------------------------------------- | ------------------------------------------- |
| `ENV_FILE`                                        | `.env` 전체 (ENABLE_DEVTOOLS=true 상태)     |
| `GOOGLE_SERVICES_JSON_DEV`                        | Android dev용 google-services.json          |
| `GOOGLE_SERVICE_INFO_PLIST_DEV`                   | iOS dev용 GoogleService-Info.plist          |
| `FIREBASE_SERVICE_ACCOUNT`                        | App Distribution 권한 서비스 계정 키 JSON   |
| `FIREBASE_APP_ID_ANDROID` / `FIREBASE_APP_ID_IOS` | dev 프로젝트 앱 ID                          |
| `IOS_CERT_P12` / `IOS_CERT_PASSWORD`              | Apple Development 인증서(base64) / 비밀번호 |
| `IOS_PROVISIONING_PROFILES`                       | 프로비저닝 프로파일 2개 tar+base64          |
| `DISCORD_WEBHOOK_URL`                             | 배포 알림 채널 webhook                      |
| (vars) `FIREBASE_TESTER_GROUP`                    | 비밀 아님 — Variables로 관리                |

## 사용자 선행 준비 (구현과 병행 가능)

1. 로컬 맥: Apple Development 인증서 .p12 내보내기, 프로비저닝 프로파일 2개 tar+base64 (Apple 포털 작업 불필요)
2. Firebase 콘솔(dev): App Distribution 활성화, 테스터 그룹 생성, 서비스 계정 키 발급
3. Discord: 알림 채널 webhook 생성
4. 위 값 전부 GitHub Secrets/Vars 등록

## 리스크 / 확인 사항

- **iOS development 서명**: UDID 미등록 기기는 설치 불가. 테스터 추가 시 포털에 UDID 등록 → 로컬에서 프로파일 갱신 → `IOS_PROVISIONING_PROFILES` 시크릿 교체가 필요하다(자동 갱신이 아님). 기기 100대 한도가 차거나 이 수동 갱신이 잦아지면 ASC 키 자동 발급 또는 ad-hoc/TestFlight 전환 검토
- 프로파일 만료(현재 2027-07-12) 전 시크릿 교체 필요 — 만료되면 iOS 잡이 서명 단계에서 실패한다
- 인증서는 **Apple Development**를 사용한다(팀에 Distribution 인증서 없음). 만료 시 재발급 후 `IOS_CERT_P12`·`IOS_CERT_PASSWORD` 갱신 필요
- 향후 ad-hoc/App Store로 전환할 경우 `aps-environment`를 `production`으로 바꾸고 푸시 수신을 재검증해야 한다
- macOS 러너 과금(리눅스의 10배 배율) — 빌드당 15~25분 소모. private repo 무료 분량 모니터링
- 출시 노트는 커밋 제목 기반이라 문체가 개발자스럽다. 사용자 문장이 필요한 커밋에는 Release-Note 트레일러를 쓴다
- 같은 브랜치 반복 push는 같은 버전으로 재배포 — Firebase App Distribution은 동일 버전 재업로드 허용이므로 문제없음

## 파일 구성 (구현 산출물)

```
.github/workflows/distribute-dev.yml
scripts/ci/release-notes.sh        # 커밋 로그 → 출시 노트 (외부 API 없음)
scripts/ci/notify-discord.sh
ios/ExportOptions-ci.plist         # CI 전용 development export 설정
```

## 범위 외

- production 프로젝트용 워크플로우 (추후)
- TestFlight / Play 내부 테스트 트랙 배포
- 테스트·린트 CI (별도 논의)
