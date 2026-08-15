# 개발 환경 / 빌드 지침

## 환경 변수 (.env / react-native-config)

- 환경 변수는 `.env`에서 `react-native-config`로 읽는다. 키 추가 시 `react-native-config.d.ts`의 타입 선언도 함께 갱신한다.
- 현재 키: `KAKAO_APP_KEY(_WITH_KAKAO)`, `GOOGLE_WEB_CLIENT_ID`, `REVERSED_CLIENT_ID`, `DEV_API_URL`, `PACKAGE_VERSION`, `ENABLE_DEVTOOLS`.
- **`.env` 값 변경은 Metro reload로 반영되지 않는다 — 네이티브 재빌드가 필요하다.** 관련 이슈 디버깅 시 이것부터 의심한다.
- `.env`에는 실제 키 값이 들어 있다. 값을 코드·로그·보고에 노출하지 않는다.

## 개발 도구 (`__dev__`)

- 개발용 UI·도구는 전부 `src/components/__dev__/`에 격리한다. 프로덕션 코드(화면·훅)에 dev 전용 분기를 흩뿌리지 않는다.
- 개발 모드 여부는 `utils/env.ts`의 **`IS_DEV_MODE`만** 사용한다(`__DEV__ || ENABLE_DEVTOOLS === 'true'`). `__DEV__`를 직접 쓰면 dev 릴리즈 빌드(`build:dev:*`)에서 동작하지 않는다.
- dev 빌드 스크립트(`build:dev:android/ios`)는 `.env`의 `ENABLE_DEVTOOLS`를 일시 변경 후 원복한다 — 빌드 스크립트를 수정할 때 이 sed 토글 로직을 깨뜨리지 않는다.

## patch-package

- node_modules 라이브러리 수정이 불가피할 때만 `patches/`에 patch-package로 관리한다(`postinstall`에서 자동 적용). 현재 `react-native-calendars` 패치가 있다.
- 라이브러리 버전을 올릴 때는 **해당 패치가 새 버전에 적용되는지 반드시 확인**하고, 패치 파일명 버전도 갱신한다(`react-native-calendars+<버전>.patch`).
- 패치를 추가·수정하면 패치가 왜 필요한지 커밋 메시지에 남긴다.

## 버전 / 릴리즈

- 앱 버전은 `package.json` `version`이 기준이며, 네이티브 버전 반영은 react-native-version을 사용한다(기존 커밋 패턴: `chore: native version 업데이트(x.y.z)` → 버전 커밋).
- 버전 변경·릴리즈 빌드는 사용자의 명시적 지시가 있을 때만 수행한다(CLAUDE.md Git 규칙과 동일한 원칙).
- 릴리즈 빌드 검증 관련: 릴리즈에서만 나는 버그는 `IS_DEV_MODE` 분기, babel `react-native-paper/babel` 프로덕션 플러그인, minify를 의심한다.

## 캐시 / 빌드 문제 해결 순서

증상이 코드로 설명되지 않을 때 아래 순서로 시도한다(오래 걸리는 단계는 실행 전에 사용자에게 확인):

1. Metro 캐시: `yarn start --reset-cache`
2. iOS: `cd ios && bundle exec pod install` (Gemfile 기반 — 전역 pod 대신 bundler 사용)
3. Android: `cd android && ./gradlew clean`
4. node_modules 재설치: `rm -rf node_modules && yarn` (postinstall로 patch 재적용됨)

## 네이티브 코드 수정 시

- `android/`·`ios/` 수정은 최소화하고, 수정 시 어떤 파일을 왜 바꿨는지 보고에 명시한다.
- 네이티브 의존성(권한, Info.plist, AndroidManifest) 변경이 필요한 라이브러리를 추가할 때는 설치 단계에서 해당 설정을 빠뜨리지 않는다 — 설치 후 iOS는 pod install까지가 한 세트다.
