# Sentry 연동 설계

2026-10-03. 에러·크래시·성능 모니터링을 위한 Sentry(@sentry/react-native) 도입 설계.

## 목적

실사용자·테스터 환경에서 나는 JS 에러, 네이티브 크래시, API 장애, 성능 저하를 수집해 원인 위치(TS 원본 스택)까지 추적한다. 백엔드(같은 teamdowith 조직)와 분산 추적으로 연결한다.

## 결정 사항

| 항목          | 결정                                                                         | 근거                                                                                                   |
| ------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| SDK           | `@sentry/react-native` **v7** 수동 설정                                      | v8은 Xcode 16.4+ 요구 — 로컬 Xcode 16.2. v7은 RN 0.65+·구 아키텍처 지원. wizard(v8 설치)는 쓰지 않는다 |
| 대상 프로젝트 | org `teamdowith` / project `jobdori-fe`                                      | 생성 완료                                                                                              |
| 수집 범위     | 에러 + 성능(트레이싱). 세션 리플레이·프로파일링은 안 함                      | 무료 한도(에러 5k/월, span 5M/월) 내 운영                                                              |
| 전송 조건     | `enabled: !__DEV__` — Metro 개발 빌드는 전송 안 함                           | Analytics와 동일한 게이트                                                                              |
| environment   | `IS_DEV_MODE`면 `development`, 아니면 `production`                           | dev 배포·prod를 한 프로젝트에서 필터로 구분                                                            |
| 사용자 정보   | `user.id = memberId`만. 닉네임·이메일·IP 전송 안 함(`sendDefaultPii: false`) | 영향 사용자 수 집계 + 개인정보 최소화                                                                  |
| 분산 추적     | 켠다. 추적 헤더는 **우리 API 호스트(`DEV_API_URL`)로 가는 요청에만** 부착    | 백엔드도 같은 조직에서 Sentry 사용 중                                                                  |
| release/dist  | 코드에서 지정하지 않고 SDK 자동값(`번들ID@버전+빌드번호`)                    | 빌드 중 소스맵 업로드와 자동으로 짝이 맞는다                                                           |

## 아키텍처

### 코어 — `utils/sentry.ts` (신규)

알림(`utils/notification.ts`)·애널리틱스(`utils/analytics.ts`)와 같은 관례로 Sentry 로직을 한 파일에 모은다.

- `initSentry()` — `Sentry.init` 1회 실행. dsn은 `.env`의 `SENTRY_DSN`(react-native-config, `react-native-config.d.ts` 타입 추가).
- `setSentryUser(memberId)` / `clearSentryUser()` — 로그인/로그아웃·초기화 시 호출.
- `captureApiError(error, context)` — React Query 전역 에러 구독에서 호출(아래).
- `navigationIntegration` — react-navigation 연동 인스턴스를 모듈에서 하나만 만들어 export.
- `tracesSampleRate`는 상수로 분리. 시작값 1.0, 사용자 증가 시 하향.

### 연결 지점

- **`index.js`**: 모듈 평가 직후 첫 실행문으로 `initSentry()` 호출(ES import는 호이스팅되어 import "이전" 실행은 불가 — `AppRegistry.registerComponent` 전이면 충분).
- **`App.tsx`**: `export default Sentry.wrap(App)` — 렌더 에러 캡처(ErrorBoundary 역할) + 앱 시작 시간 측정. `NavigationContainer`의 `onReady`에서 `navigationIntegration.registerNavigationContainer(navigationRef)`.
- **auth slice**: memberId 설정/초기화 지점(로그인, rehydrate 복원, 로그아웃)에서 `setSentryUser`/`clearSentryUser`.

## 수집 정책

### 자동 수집 (SDK 기본)

- 미처리 JS 예외·Promise rejection, 렌더 에러(`Sentry.wrap`), 네이티브 크래시, App Hang(iOS)·ANR(Android — 기본 민감도 유지, 노이즈면 조정)
- **릴리즈 헬스(크래시 프리 세션)**: 기본값 유지로 버전별 크래시 프리 비율을 받는다. 에러 한도와 별개.

### API 에러 — `captureApiError`

React Query가 에러를 삼키므로 자동 수집되지 않는다. App.tsx의 기존 전역 에러 구독(`subscribeListener`)에서 호출한다.

| 경우                                   | level                             |
| -------------------------------------- | --------------------------------- |
| 응답 없음(네트워크·타임아웃), HTTP 5xx | `error`                           |
| HTTP 4xx                               | `warning`                         |
| E302 토큰 만료 → 재발급 경로           | 수집 안 함(기존 조용한 처리 유지) |

- **fingerprint**: `메서드 + 엔드포인트 + 상태`. 엔드포인트의 숫자 ID는 `:id`로 치환해 같은 API가 이슈 하나로 묶이게 한다.
- **태그**: method, endpoint, http 상태, 서버 `statusCode`, query/mutation 구분.
- **보내지 않는 것**: 요청 헤더(Authorization)·요청 본문.
- 4xx 수집은 한도를 빨리 소모할 수 있다 — 한도 근접 시 4xx만 샘플링하는 후속 옵션을 열어둔다.

### breadcrumb

- 화면 이동·HTTP(메서드/URL/상태)·터치는 자동 수집 유지.
- **콘솔 breadcrumb는 끈다** — 기존 코드가 `console.error(errorData)`로 서버 응답을 통째로 찍어 개인정보가 섞일 수 있다.

### ignoreErrors (시작 목록)

사용자의 정상 행동이 에러로 던져지는 것만 처음부터 거른다. 정확한 메시지는 구현 시 로그인 코드를 읽고 확정한다.

- 소셜 로그인 취소: 카카오 `user cancelled`, 애플 `1001`(canceled), 구글 `12501`(SIGN_IN_CANCELLED)
- `Non-Error promise rejection captured`
- `Network Error`류 패턴은 넣지 않는다 — 의도적으로 수집하는 API 네트워크 에러까지 걸러진다. 나머지는 실데이터를 보고 추가.

### 성능

- 앱 시작 시간, 화면 전환·로딩(react-navigation 연동), API 요청 시간(HTTP span).
- `tracePropagationTargets`: 우리 API 호스트만. 외부 서비스(카카오·구글 등) 요청에는 추적 헤더를 붙이지 않는다.

## 소스맵·디버그 심볼 업로드

| 위치                                                  | 변경                                    | 역할                                |
| ----------------------------------------------------- | --------------------------------------- | ----------------------------------- |
| `metro.config.js`                                     | 기존 설정을 `withSentryConfig`로 감쌈   | 번들에 debug ID 주입(소스맵 매칭)   |
| `android/app/build.gradle`                            | `sentry.gradle` 적용                    | 릴리즈 번들 생성 시 소스맵 업로드   |
| Xcode "Bundle React Native code and images"           | `sentry-xcode.sh`로 래핑                | Release 빌드 시 소스맵 업로드       |
| Xcode 빌드 페이즈 추가                                | "Upload Debug Symbols to Sentry"        | dSYM 업로드(네이티브 크래시 심볼화) |
| `ios/sentry.properties` · `android/sentry.properties` | org/project/url만(토큰 없음), 커밋 대상 | 업로드 대상 지정                    |

- Debug 빌드는 업로드하지 않는다(Release 구성에서만).
- iOS Release의 `DEBUG_INFORMATION_FORMAT`이 `dwarf-with-dsym`인지 확인하고 아니면 변경.
- Android는 현재 ProGuard 미사용 — 매핑 업로드 불필요.

### Auth Token (저장소에 두지 않음)

- **CI**: GitHub 시크릿 `SENTRY_AUTH_TOKEN`을 빌드 스텝 env로 주입.
- **로컬**: 각자 `~/.sentryclirc`에 토큰 저장(sentry-cli가 자동으로 읽음). 방법은 `dev-environment.md`에 기록.

### 업로드 실패 정책

- `build-apps.yml`(workflow_call 공용)에 **`upload-sourcemaps` boolean input** 추가. false면 `SENTRY_DISABLE_AUTO_UPLOAD=true` 주입.
- `distribute-dev`(실배포): true — 업로드 실패 시 **빌드 실패**(소스맵 없는 배포 방지).
- `verify-build`(주기 검증): false — 업로드 생략.
- 토큰 없는 로컬 빌드: `SENTRY_DISABLE_AUTO_UPLOAD=true`로 생략 가능, 빌드는 깨지지 않는다.

## 알림 규칙 (Sentry 콘솔 — 코드 아님)

초기 트래픽 기준. 사용자가 늘면(수백 DAU) 상향하고 분기마다 점검한다.

| 규칙      | 조건                                       | 의도                                                                                |
| --------- | ------------------------------------------ | ----------------------------------------------------------------------------------- |
| 새 이슈   | 처음 보는 이슈, level ≥ error              | 신규 버그 즉시 인지. warning(4xx) 신규는 제외                                       |
| 확산 감지 | 한 이슈의 영향 사용자 **3명 이상 / 1시간** | 이벤트 수 대신 사용자 수 — 소수 사용자 환경에서 한 명의 반복을 장애로 오인하지 않게 |

## 검증 계획

dev 배포 빌드(릴리즈 + ENABLE_DEVTOOLS)로 확인한다. Metro 빌드는 전송이 꺼져 있다.

1. 개발자도구(`__dev__`)에 "Sentry 테스트 에러" 버튼 추가 — JS 에러·API 에러·네이티브 크래시 3종 발생 → 이슈 생성 확인
2. 이슈 스택이 TS 원본 파일·줄로 보이는지(소스맵)
3. iOS 네이티브 크래시가 심볼 해석되는지(dSYM)
4. 앱 API 트레이스에 백엔드 트랜잭션이 이어지는지(분산 추적)
5. Releases 화면에 버전별 크래시 프리 세션이 쌓이는지

## 사용자가 직접 할 일 (콘솔·시크릿)

- GitHub 시크릿 `SENTRY_AUTH_TOKEN` 등록, `ENV_FILE` 시크릿에 `SENTRY_DSN` 추가
- 알림 규칙 2개 설정(위 표), 알림 채널(Discord 등) 연결
- 로컬 업로드 시 `~/.sentryclirc` 토큰 설정

## 문서화

- `.claude/rules/dev-environment.md`에 Sentry 절 추가: 로컬 토큰 설정, `SENTRY_DISABLE_AUTO_UPLOAD`, "전송은 릴리즈 빌드만" 규칙

## 범위 밖 (명시)

- 세션 리플레이, 프로파일링
- 렌더 에러 폴백 UI(수집만 하고 화면은 후속)
- ignoreErrors 확장·4xx 샘플링 — 실데이터 확인 후
- prod Firebase/Sentry 파이프라인 분리 — prod 배포 체계 생길 때
