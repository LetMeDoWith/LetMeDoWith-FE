# dev 배포 워크플로우 셋업 가이드

`test/X.Y.Z` 브랜치 push 시 자동 배포가 동작하려면 아래 GitHub Secrets/Vars 등록이 선행돼야 한다.
(Settings → Secrets and variables → Actions)

## Secrets

| 이름                                              | 얻는 방법                                                                                                                     |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `ENV_FILE`                                        | 로컬 `.env` 파일 내용 전체를 붙여넣기 (`ENABLE_DEVTOOLS` 값은 워크플로우가 true로 덮어씀)                                     |
| `GOOGLE_SERVICES_JSON_DEV`                        | Firebase 콘솔(dev) → 프로젝트 설정 → Android 앱 → `google-services.json` 다운로드 후 내용 붙여넣기                            |
| `GOOGLE_SERVICE_INFO_PLIST_DEV`                   | Firebase 콘솔(dev) → iOS 앱 → `GoogleService-Info.plist` 내용 붙여넣기                                                        |
| `FIREBASE_SERVICE_ACCOUNT`                        | GCP 콘솔(dev 프로젝트) → 서비스 계정 생성 → 역할 "Firebase App Distribution 관리자" → JSON 키 발급 후 내용 붙여넣기           |
| `FIREBASE_APP_ID_ANDROID` / `FIREBASE_APP_ID_IOS` | Firebase 콘솔 → 프로젝트 설정 → 앱별 "앱 ID" (`1:xxxx:android:xxxx` 형식)                                                     |
| `IOS_CERT_P12`                                    | 키체인 접근 → **내 인증서** → `Apple Development: <이름>` 우클릭 → 내보내기(.p12) 후 `base64 -i cert.p12 \| pbcopy`           |
| `IOS_CERT_PASSWORD`                               | 위 .p12 내보낼 때 지정한 비밀번호                                                                                             |
| `ASC_API_KEY_P8`                                  | App Store Connect → 사용자 및 액세스 → 통합 → API 키 생성(App Manager) → .p8 다운로드 후 `base64 -i AuthKey_XXX.p8 \| pbcopy` |
| `ASC_KEY_ID` / `ASC_ISSUER_ID`                    | 위 API 키 페이지에 표시되는 Key ID / Issuer ID                                                                                |
| `DISCORD_WEBHOOK_URL`                             | Discord 채널 설정 → 연동 → 웹후크 생성 → URL 복사                                                                             |
| `NOTION_TOKEN`                                    | notion.so/my-integrations → integration 생성 → 토큰 복사. **배포 기록 페이지에서 해당 integration을 연결(⋯ → 연결)해야 함**   |
| `ANTHROPIC_API_KEY`                               | console.anthropic.com → API Keys                                                                                              |

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

프로비저닝 프로파일은 ASC API 키를 통해 CI가 자동 생성·갱신하므로 수동 관리가 필요 없다. 테스터를 추가할 때는 포털에 UDID만 등록하고 재배포하면 된다.

ad-hoc 방식으로 전환하려면 Apple Distribution 인증서 발급 + `aps-environment`를 `production`으로 변경 + 푸시 재검증이 필요하다. 등록 기기 100대 한도에 근접하거나 배포 대상이 넓어질 때 검토한다.

## 배포 방법

1. `test/X.Y.Z` 브랜치 생성 후 push → 워크플로우 자동 실행
2. 버전 커밋이 자동 추가되므로 push 후에는 `git pull`로 로컬을 갱신할 것
3. 결과는 Discord 채널 / Notion 배포 기록 페이지 / Actions 탭에서 확인
