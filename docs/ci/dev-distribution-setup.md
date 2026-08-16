# dev 배포 워크플로우 셋업 가이드

`test/X.Y.Z` 브랜치 push 시 자동 배포가 동작하려면 아래 GitHub Secrets/Vars 등록이 선행돼야 한다.
(Settings → Secrets and variables → Actions)

## Secrets

| 이름                                              | 얻는 방법                                                                                                                   |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `ENV_FILE`                                        | 로컬 `.env` 파일 내용 전체를 붙여넣기 (`ENABLE_DEVTOOLS` 값은 워크플로우가 true로 덮어씀)                                   |
| `GOOGLE_SERVICES_JSON_DEV`                        | Firebase 콘솔(dev) → 프로젝트 설정 → Android 앱 → `google-services.json` 다운로드 후 내용 붙여넣기                          |
| `GOOGLE_SERVICE_INFO_PLIST_DEV`                   | Firebase 콘솔(dev) → iOS 앱 → `GoogleService-Info.plist` 내용 붙여넣기                                                      |
| `FIREBASE_SERVICE_ACCOUNT`                        | GCP 콘솔(dev 프로젝트) → 서비스 계정 생성 → 역할 "Firebase App Distribution 관리자" → JSON 키 발급 후 내용 붙여넣기         |
| `FIREBASE_APP_ID_ANDROID` / `FIREBASE_APP_ID_IOS` | Firebase 콘솔 → 프로젝트 설정 → 앱별 "앱 ID" (`1:xxxx:android:xxxx` 형식)                                                   |
| `IOS_CERT_P12`                                    | 키체인 접근 → **내 인증서** → `Apple Development: <이름>` 우클릭 → 내보내기(.p12) 후 `base64 -i cert.p12 \| pbcopy`         |
| `IOS_CERT_PASSWORD`                               | 위 .p12 내보낼 때 지정한 비밀번호                                                                                           |
| `IOS_PROVISIONING_PROFILES`                       | 로컬의 프로파일 2개를 묶어 인코딩 (아래 명령 참고)                                                                          |
| `DISCORD_WEBHOOK_URL`                             | Discord 채널 설정 → 연동 → 웹후크 생성 → URL 복사                                                                           |
| `NOTION_TOKEN`                                    | notion.so/my-integrations → integration 생성 → 토큰 복사. **배포 기록 페이지에서 해당 integration을 연결(⋯ → 연결)해야 함** |
| `ANTHROPIC_API_KEY`                               | console.anthropic.com → API Keys                                                                                            |

## Variables

| 이름                    | 값                                                                     |
| ----------------------- | ---------------------------------------------------------------------- |
| `FIREBASE_TESTER_GROUP` | Firebase 콘솔 → App Distribution → 테스터 및 그룹에서 만든 그룹의 별칭 |
| `NOTION_PAGE_ID`        | 배포 기록 페이지 URL 끝의 32자리 ID                                    |

## 기타 선행 작업

- Firebase 콘솔(dev)에서 Android/iOS 앱 각각 App Distribution "시작하기" 1회 실행
- Apple Developer → Devices에 테스터 기기 UDID 등록 (미등록 기기는 iOS 설치 불가)

## iOS 서명 방식 참고

CI는 **development 서명**으로 IPA를 만든다(`ios/ExportOptions-ci.plist`). 기존 수동 배포와 동일한 방식이라 `aps-environment: development` 엔타이틀먼트와 맞아 푸시 알림이 그대로 동작한다.

CI 러너에는 개발자 계정 로그인이 없으므로, **로컬 맥의 프로비저닝 프로파일을 시크릿으로 전달**한다. 인코딩 명령:

```bash
cd ~/Library/Developer/Xcode/UserData/Provisioning\ Profiles
COPYFILE_DISABLE=1 tar cf - *.mobileprovision | gzip -9 | base64 | tr -d '\n' | pbcopy
```

> `tar czf`로 한 번에 압축하지 않는 이유: macOS tar는 압축을 마친 뒤 출력을 블록 경계까지 0으로 패딩해, base64 끝에 불필요한 `A`가 길게 붙고 크기가 두 배가 된다(동작에는 지장 없음). tar와 gzip을 분리하면 패딩이 압축돼 사라진다.

> Xcode 15 이하를 쓴다면 프로파일 경로가 `~/Library/MobileDevice/Provisioning Profiles`다.

**프로파일 갱신이 필요한 시점** (둘 중 하나라도 해당되면 위 명령을 다시 실행해 시크릿을 교체):

- 테스터 기기(UDID)를 추가한 뒤 — 포털 등록 후 Xcode에서 한 번 빌드하면 프로파일이 갱신된다
- 프로파일 만료 전 (현재 것은 2027-07-12 만료)

수동 갱신이 번거로워지면 App Store Connect API 키(`-allowProvisioningUpdates`) 방식으로 전환해 CI가 자동 발급하도록 바꿀 수 있다.

ad-hoc 방식으로 전환하려면 Apple Distribution 인증서 발급 + `aps-environment`를 `production`으로 변경 + 푸시 재검증이 필요하다. 등록 기기 100대 한도에 근접하거나 배포 대상이 넓어질 때 검토한다.

## 배포 방법

1. `test/X.Y.Z` 브랜치 생성 후 push → 워크플로우 자동 실행
2. 버전 커밋이 자동 추가되므로 push 후에는 `git pull`로 로컬을 갱신할 것
3. 결과는 Discord 채널 / Notion 배포 기록 페이지 / Actions 탭에서 확인
