# Sentry 연동 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** @sentry/react-native v7을 수동 설정으로 연동해 에러·크래시·성능을 수집하고, 소스맵·dSYM 업로드를 로컬/CI 빌드에 연결한다.

**Architecture:** Sentry 로직은 `utils/sentry.ts` 한 파일에 모은다(알림·애널리틱스와 같은 관례). API 에러는 App.tsx의 기존 React Query 전역 에러 구독에서 `captureApiError`로 수집한다. 소스맵 업로드는 metro·gradle·Xcode 빌드에 끼워 넣고, 토큰이 없으면 `SENTRY_DISABLE_AUTO_UPLOAD=true`로 건너뛴다.

**Tech Stack:** @sentry/react-native ^7.13.0, RN 0.73.3(구 아키텍처), react-navigation 6, @tanstack/react-query 5, GitHub Actions

**Spec:** `docs/superpowers/specs/2026-10-03-sentry-integration-design.md`

## Global Constraints

- SDK는 **v7 고정**(`@sentry/react-native@^7.13.0`). v8은 Xcode 16.4+ 요구 — 로컬 Xcode 16.2라 금지.
- 전송 게이트는 `enabled: !__DEV__` 하나. `IS_DEV_MODE`를 게이트로 쓰지 않는다(environment 구분에만 사용).
- `sendDefaultPii: false`. user는 `id`(memberId 문자열)만. 요청 헤더·본문은 Sentry로 보내지 않는다.
- import는 경로 별칭(`utils/*`, `services/*` …), 여러 줄 주석은 `/* */`, 파일 하단 일괄 named export.
- 커밋 메시지는 한국어 `type: 요약`, **Co-Authored-By 넣지 않음**(CLAUDE.md 규칙이 전역 안내보다 우선).
- 각 Task 완료 시 해당 파일에 prettier 적용, 마지막 Task에서 eslint·tsc·jest 전체 통과.
- `.env` 실제 값은 로그·보고에 노출하지 않는다(DSN은 클라이언트 공개값이라 예외).

## Review Focus

스펙이 암시하지만 테스트가 없으면 깨지기 쉬운 입력 5가지. 각 항목의 테스트를 해당 Task에 포함했다.

1. **응답 없는 에러**(네트워크 끊김·타임아웃: `error.response === undefined`) → level `error`, fingerprint `no-response`로 수집돼야 한다. — Task 3 테스트
2. **E302(토큰 만료)** 는 refresh 토큰 유무와 무관하게 Sentry에 수집되면 안 된다(재발급 실패로 App.tsx 조기 return을 지나쳐도). — Task 3 테스트(captureApiError 내부 가드)
3. **경로 숫자 세그먼트만 `:id` 치환**: `v1/task/123/feedback/45?page=2` → `v1/task/:id/feedback/:id`. `v1`의 1이 치환되면 안 된다. — Task 3 테스트
4. **initSentry 중복 호출**(fast refresh·재마운트) 시 `Sentry.init`은 1회만 실행돼야 한다. — Task 2 테스트
5. **memberId는 `string | null`**(auth slice 타입) — 문자열 그대로 `user.id`로 넣고, 로그아웃 시 `setUser(null)`로 해제해야 한다. — Task 2 테스트

---

### Task 1: SDK 설치 + 업로드 대상 설정 파일

**Files:**

- Modify: `package.json`, `yarn.lock`, `ios/Podfile.lock` (설치 부산물)
- Create: `ios/sentry.properties`, `android/sentry.properties`
- Modify: `react-native-config.d.ts`, `.env`(gitignore 대상 — 커밋 안 됨)

**Interfaces:**

- Produces: `Config.SENTRY_DSN: string` (react-native-config) — Task 2가 사용

- [ ] **Step 1: 패키지 설치**

```bash
yarn add @sentry/react-native@^7.13.0
cd ios && bundle exec pod install && cd ..
```

Expected: Podfile.lock에 `RNSentry` 항목 추가, `COCOAPODS: 1.14.3` 유지.

- [ ] **Step 2: sentry.properties 2개 생성** (토큰 없음 — 커밋 대상)

`ios/sentry.properties` 와 `android/sentry.properties` 둘 다 같은 내용:

```properties
defaults.org=teamdowith
defaults.project=joddori-fe
defaults.url=https://sentry.io/
```

- [ ] **Step 3: .env와 타입 추가**

`.env`에 추가(이 값은 Sentry 콘솔 공개 DSN):

```
SENTRY_DSN=https://3017b924136df176c76eee5c3c2a7d7b@o4511756850561024.ingest.us.sentry.io/4512191329075200
```

`react-native-config.d.ts`의 declare 블록에 한 줄 추가:

```ts
const SENTRY_DSN: string;
```

- [ ] **Step 4: 타입 검사**

Run: `npx tsc --noEmit`
Expected: 에러 0

- [ ] **Step 5: Commit**

```bash
git add package.json yarn.lock ios/Podfile.lock ios/sentry.properties android/sentry.properties react-native-config.d.ts
git commit -m "chore: @sentry/react-native v7 설치 및 업로드 대상 설정"
```

---

### Task 2: 코어 `utils/sentry.ts` — init·user·navigation 연동

**Files:**

- Create: `src/utils/sentry.ts`
- Test: `src/utils/__tests__/sentry.test.ts`

**Interfaces:**

- Consumes: `Config.SENTRY_DSN`, `Config.DEV_API_URL`(Task 1), `IS_DEV_MODE`(`utils/env`)
- Produces(후속 Task가 사용):

  - `initSentry(): void`
  - `setSentryUser(memberId: string): void` / `clearSentryUser(): void` (auth slice의 memberId는 `string | null`)
  - `navigationIntegration` — `registerNavigationContainer(ref)` 보유
  - `TRACES_SAMPLE_RATE: number`(상수, 현재 1.0)

- [ ] **Step 1: 실패하는 테스트 작성** — `src/utils/__tests__/sentry.test.ts`

```ts
/*
 * Sentry 코어 로직 테스트. 네이티브 SDK는 모킹하고 init 가드·user 매핑만 검증한다.
 * (jest 변수 호이스팅 제약 때문에 모킹 객체는 mock 접두사를 쓴다)
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockInit = jest.fn();
const mockSetUser = jest.fn();

jest.mock('@sentry/react-native', () => ({
  init: mockInit,
  setUser: mockSetUser,
  withScope: jest.fn(),
  captureException: jest.fn(),
  reactNavigationIntegration: jest.fn(() => ({ registerNavigationContainer: jest.fn() })),
}));

jest.mock('react-native-config', () => ({
  SENTRY_DSN: 'https://test@test.ingest.sentry.io/1',
  DEV_API_URL: 'api.test.com',
  ENABLE_DEVTOOLS: 'false',
}));

import { initSentry, setSentryUser, clearSentryUser } from 'utils/sentry';

describe('initSentry', () => {
  beforeEach(() => {
    mockInit.mockClear();
    mockSetUser.mockClear();
  });

  it('두 번 호출해도 Sentry.init은 1회만 실행된다', () => {
    initSentry();
    initSentry();
    expect(mockInit).toHaveBeenCalledTimes(1);
  });

  it('jest(__DEV__) 환경에서는 enabled=false로 초기화된다', () => {
    initSentry();
    expect(mockInit.mock.calls[0][0]).toMatchObject({ enabled: false, sendDefaultPii: false });
  });
});

describe('Sentry user', () => {
  it('memberId를 user.id로 설정한다', () => {
    setSentryUser('42');
    expect(mockSetUser).toHaveBeenCalledWith({ id: '42' });
  });

  it('clear 시 null을 넘겨 해제한다', () => {
    clearSentryUser();
    expect(mockSetUser).toHaveBeenCalledWith(null);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx jest src/utils/__tests__/sentry.test.ts`
Expected: FAIL — `utils/sentry` 모듈 없음

- [ ] **Step 3: 구현** — `src/utils/sentry.ts`

```ts
import * as Sentry from '@sentry/react-native';
import Config from 'react-native-config';

import { IS_DEV_MODE } from 'utils/env';

/*
 * 에러·성능 모니터링 코어. init·user·API 에러 캡처·내비게이션 연동을 이 파일에 모은다
 * (알림 utils/notification.ts, 애널리틱스 utils/analytics.ts와 같은 관례).
 *
 * 전송 게이트는 __DEV__만이다. Metro 개발 빌드는 보내지 않고, dev 배포 빌드(IS_DEV_MODE)는
 * environment='development'로, 추후 prod는 'production'으로 한 프로젝트 안에서 구분한다.
 */

/* 성능 트레이스 샘플링 비율. 사용자가 늘어 span 한도(5M/월)에 근접하면 이 값부터 낮춘다. */
const TRACES_SAMPLE_RATE = 1.0;

/*
 * 화면 전환·로딩 시간 측정용 react-navigation 연동.
 * App.tsx의 NavigationContainer onReady에서 registerNavigationContainer를 호출해야 동작한다.
 */
const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
});

/* fast refresh·재마운트로 중복 호출돼도 1회만 초기화한다(notification.ts의 initialized 패턴) */
let initialized = false;

const initSentry = () => {
  if (initialized) {
    return;
  }
  initialized = true;

  Sentry.init({
    dsn: Config.SENTRY_DSN,
    /* Metro 개발 빌드는 전송하지 않는다 — 릴리즈(dev 배포 포함) 빌드만 */
    enabled: !__DEV__,
    environment: IS_DEV_MODE ? 'development' : 'production',
    /* IP 등 기본 개인정보 비전송. user는 setSentryUser가 id만 넣는다 */
    sendDefaultPii: false,
    tracesSampleRate: TRACES_SAMPLE_RATE,
    /*
     * 분산 추적 헤더(sentry-trace/baggage)는 우리 API로 가는 요청에만 붙인다.
     * 백엔드도 같은 teamdowith 조직에서 Sentry를 쓰므로 트레이스가 서버까지 이어진다.
     * 외부 서비스(카카오·구글 등) 요청에는 붙이지 않는다.
     */
    tracePropagationTargets: [Config.DEV_API_URL],
    integrations: [navigationIntegration],
    /*
     * 사용자의 정상 행동이 에러로 던져지는 것만 처음부터 거른다.
     * 'Network Error'류는 넣지 않는다 — 의도적으로 수집하는 API 네트워크 에러까지 걸러진다.
     */
    ignoreErrors: [
      /Non-Error promise rejection captured/,
      /user cancelled/i /* 카카오 로그인 취소 */,
      /com\.apple\.AuthenticationServices\.AuthorizationError error 1001/ /* 애플 로그인 취소 */,
      /SIGN_IN_CANCELLED|12501/ /* 구글 로그인 취소 */,
    ],
    /*
     * 콘솔 breadcrumb는 끈다 — 기존 console.error가 서버 응답을 통째로 찍는 곳이 있어
     * 그대로 두면 에러 이벤트에 개인정보가 섞여 나간다.
     */
    beforeBreadcrumb: breadcrumb => (breadcrumb.category === 'console' ? null : breadcrumb),
  });
};

/* 로그인·복원 시 호출. 영향받은 사용자 수 집계용 — id 외의 개인정보는 넣지 않는다 */
const setSentryUser = (memberId: string) => {
  Sentry.setUser({ id: memberId });
};

/* 로그아웃·계정 초기화 시 호출 */
const clearSentryUser = () => {
  Sentry.setUser(null);
};

export { initSentry, setSentryUser, clearSentryUser, navigationIntegration, TRACES_SAMPLE_RATE };
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx jest src/utils/__tests__/sentry.test.ts`
Expected: PASS (4개)

- [ ] **Step 5: Commit**

```bash
npx prettier --write src/utils/sentry.ts src/utils/__tests__/sentry.test.ts
git add src/utils/sentry.ts src/utils/__tests__/sentry.test.ts
git commit -m "feat: Sentry 코어 도입 — init 게이트·user·내비게이션 연동"
```

---

### Task 3: `captureApiError` + App.tsx 전역 에러 구독 연결

**Files:**

- Modify: `src/utils/sentry.ts`
- Modify: `App.tsx` (`subscribeListener`, 82행 부근)
- Test: `src/utils/__tests__/sentry.test.ts`

**Interfaces:**

- Consumes: `ApiError`(`services/apiClient`, type-only라 런타임 순환 없음), `ErrorStatusCodeEnum`
- Produces: `captureApiError(error: ApiError, kind: 'query' | 'mutation'): void`, `normalizeEndpoint(url?: string): string`

- [ ] **Step 1: ErrorStatusCodeEnum import 경로 확인**

Run: `grep -n "ErrorStatusCodeEnum" App.tsx | head -2`
Expected: `schemes/shared/enum` — Task 3 Step 4의 import가 이 경로와 일치하는지 확인만 한다.

- [ ] **Step 2: 실패하는 테스트 추가** — `sentry.test.ts`에 덧붙임

```ts
import { captureApiError, normalizeEndpoint } from 'utils/sentry';

/* withScope 모킹을 scope 검증형으로 교체: 파일 상단 jest.mock 팩토리를 아래로 수정한다 */
const mockScope = { setLevel: jest.fn(), setTag: jest.fn(), setFingerprint: jest.fn() };
const mockCaptureException = jest.fn();
/* jest.mock('@sentry/react-native', ...) 팩토리에 추가:
 *   withScope: (cb: (scope: typeof mockScope) => void) => cb(mockScope),
 *   captureException: mockCaptureException,
 */

const makeApiError = (over: { status?: number; statusCode?: string; url?: string; method?: string }) =>
  ({
    response:
      over.status === undefined
        ? undefined
        : { status: over.status, data: over.statusCode ? { statusCode: over.statusCode } : {} },
    config: { url: over.url ?? 'v1/task/123', method: over.method ?? 'post' },
  } as never);

describe('normalizeEndpoint', () => {
  it('숫자 세그먼트만 :id로 치환하고 쿼리스트링을 제거한다', () => {
    expect(normalizeEndpoint('v1/task/123/feedback/45?page=2')).toBe('v1/task/:id/feedback/:id');
    expect(normalizeEndpoint(undefined)).toBe('unknown');
  });
});

describe('captureApiError', () => {
  beforeEach(() => {
    mockCaptureException.mockClear();
    mockScope.setLevel.mockClear();
    mockScope.setFingerprint.mockClear();
  });

  it('응답이 없으면(네트워크) error 레벨, no-response fingerprint로 수집한다', () => {
    captureApiError(makeApiError({}), 'query');
    expect(mockScope.setLevel).toHaveBeenCalledWith('error');
    expect(mockScope.setFingerprint).toHaveBeenCalledWith(['POST', 'v1/task/:id', 'no-response']);
    expect(mockCaptureException).toHaveBeenCalledTimes(1);
  });

  it('5xx는 error, 4xx는 warning 레벨이다', () => {
    captureApiError(makeApiError({ status: 500 }), 'mutation');
    expect(mockScope.setLevel).toHaveBeenLastCalledWith('error');
    captureApiError(makeApiError({ status: 404 }), 'query');
    expect(mockScope.setLevel).toHaveBeenLastCalledWith('warning');
  });

  it('E302(토큰 만료)는 수집하지 않는다', () => {
    captureApiError(makeApiError({ status: 401, statusCode: 'E302' }), 'query');
    expect(mockCaptureException).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: 실패 확인**

Run: `npx jest src/utils/__tests__/sentry.test.ts`
Expected: FAIL — `captureApiError` 미정의

- [ ] **Step 4: 구현** — `utils/sentry.ts`에 추가

```ts
import { ErrorStatusCodeEnum } from 'schemes/shared/enum';
import type { ApiError } from 'services/apiClient';

/* 경로의 숫자 세그먼트를 :id로 바꿔 같은 API가 이슈 하나로 묶이게 한다('v1'의 1은 치환 안 됨) */
const normalizeEndpoint = (url?: string) => {
  if (!url) {
    return 'unknown';
  }
  return url
    .split('?')[0]
    .split('/')
    .map(segment => (/^\d+$/.test(segment) ? ':id' : segment))
    .join('/');
};

/*
 * React Query 전역 에러 구독(App.tsx subscribeListener)에서 호출한다.
 * - 응답 없음(네트워크·타임아웃)·5xx: error / 4xx: warning
 * - E302(토큰 만료→재발급 경로)는 수집하지 않는다. App.tsx의 조기 return과 별개로
 *   여기서도 막아야 재발급 실패로 조기 return을 지나친 경우까지 걸러진다.
 * - 요청 헤더(Authorization)·본문은 보내지 않는다 — 태그·fingerprint만 구성한다.
 */
const captureApiError = (error: ApiError, kind: 'query' | 'mutation') => {
  if (error.response?.data?.statusCode === ErrorStatusCodeEnum.enum.E302) {
    return;
  }

  const status = error.response?.status;
  const method = (error.config?.method ?? 'unknown').toUpperCase();
  const endpoint = normalizeEndpoint(error.config?.url);
  const isClientError = status !== undefined && status >= 400 && status < 500;

  Sentry.withScope(scope => {
    scope.setLevel(isClientError ? 'warning' : 'error');
    scope.setTag('api.kind', kind);
    scope.setTag('api.method', method);
    scope.setTag('api.endpoint', endpoint);
    scope.setTag('api.http_status', String(status ?? 'no-response'));
    if (error.response?.data?.statusCode) {
      scope.setTag('api.status_code', error.response.data.statusCode);
    }
    scope.setFingerprint([method, endpoint, String(status ?? 'no-response')]);
    Sentry.captureException(error);
  });
};
```

하단 export에 `captureApiError, normalizeEndpoint` 추가.

- [ ] **Step 5: 테스트 통과 확인**

Run: `npx jest src/utils/__tests__/sentry.test.ts`
Expected: PASS (8개)

- [ ] **Step 6: App.tsx 연결** — `subscribeListener`의 토큰 재발급 조기 return **다음**, 콘솔 로깅 앞에 추가

```ts
/* API 에러를 Sentry로 수집(E302는 내부에서 제외). 콘솔 로그·스낵바는 기존 동작 유지 */
captureApiError(event.action.error, 'query' in event ? 'query' : 'mutation');
```

상단 import: `import { captureApiError } from 'utils/sentry';`

- [ ] **Step 7: 검증 후 Commit**

Run: `npx tsc --noEmit && npx jest`
Expected: 모두 통과

```bash
npx prettier --write src/utils/sentry.ts src/utils/__tests__/sentry.test.ts App.tsx
git add src/utils/sentry.ts src/utils/__tests__/sentry.test.ts App.tsx
git commit -m "feat: API 에러 Sentry 수집 — 레벨·fingerprint 규칙과 E302 제외"
```

---

### Task 4: 진입점·사용자 연동 (index.js, App.tsx, auth)

**Files:**

- Modify: `index.js`, `App.tsx`, `src/stores/auth/slice.ts`, `src/stores/index.ts`

**Interfaces:**

- Consumes: `initSentry`, `navigationIntegration`, `setSentryUser`, `clearSentryUser` (Task 2)

- [ ] **Step 1: index.js — 모듈 평가 직후 초기화**

상단 import 묶음에 `import { initSentry } from 'utils/sentry';` 추가 후, `AppRegistry.registerComponent` **직전**에:

```js
/*
 * 가능한 가장 이른 시점에 초기화한다. ES import는 호이스팅되어 import "이전" 실행은
 * 불가능하므로, 모듈 평가가 끝난 직후 첫 실행문이면 충분하다.
 */
initSentry();
```

- [ ] **Step 2: App.tsx — wrap과 내비게이션 등록**

```ts
import * as Sentry from '@sentry/react-native';
import { navigationIntegration } from 'utils/sentry';
```

- `<NavigationContainer ref={navigationRef} ...>`에 prop 추가(270행 부근):

```tsx
onReady={() => navigationIntegration.registerNavigationContainer(navigationRef)}
```

- 마지막 줄 `export default App;` → `export default Sentry.wrap(App);`
  (`Sentry.wrap`은 렌더 에러 캡처 + 앱 시작 시간 측정을 겸한다)

- [ ] **Step 3: auth slice — 로그인/로그아웃 연동** (`src/stores/auth/slice.ts`)

```ts
import { clearSentryUser, setSentryUser } from 'utils/sentry';
```

- `setMemberId` 액션 수정:

```ts
setMemberId: id => {
  set({ memberId: id });
  /* 에러 이벤트의 영향 사용자 집계용. id 외의 개인정보는 보내지 않는다 */
  if (id !== null) {
    setSentryUser(id);
  } else {
    clearSentryUser();
  }
},
```

- `initAuthInfo`의 `set({ ...initialAuthState, isHydrated: true });` 직후에 `clearSentryUser();` 추가.

- [ ] **Step 4: 재시작 복원 연동** (`src/stores/index.ts` onRehydrateStorage)

`setIsLoggedIn(true);` 직전에:

```ts
/* 앱 재시작 복원 시에는 setMemberId가 불리지 않으므로 여기서 직접 설정한다 */
if (memberId) {
  setSentryUser(memberId);
}
```

상단 import: `import { setSentryUser } from 'utils/sentry';`
(utils/sentry가 services/apiClient에서 가져오는 것은 type뿐이라 stores와 런타임 순환이 생기지 않는다)

- [ ] **Step 5: 검증 후 Commit**

Run: `npx tsc --noEmit && npx jest && npx eslint index.js App.tsx src/stores/auth/slice.ts src/stores/index.ts`
Expected: 에러 0 (기존 경고는 무방)

```bash
npx prettier --write index.js App.tsx src/stores/auth/slice.ts src/stores/index.ts
git add index.js App.tsx src/stores/auth/slice.ts src/stores/index.ts
git commit -m "feat: Sentry 진입점 연결 — init·wrap·내비게이션·사용자 식별"
```

---

### Task 5: 소스맵·dSYM 빌드 연결 (metro·gradle·Xcode)

**Files:**

- Modify: `metro.config.js`, `android/app/build.gradle`, `ios/LetMeDoWith.xcodeproj/project.pbxproj`

**Interfaces:**

- Consumes: `ios/sentry.properties`, `android/sentry.properties` (Task 1)
- Produces: 릴리즈 빌드 시 자동 업로드. `SENTRY_DISABLE_AUTO_UPLOAD=true`면 건너뜀 — Task 6(CI)이 사용

- [ ] **Step 1: metro.config.js — 마지막 줄 교체**

```js
const { withSentryConfig } = require('@sentry/react-native/metro');
```

```js
/* 번들에 debug ID를 심어 업로드된 소스맵과 정확히 짝지어 준다 */
module.exports = withSentryConfig(mergeConfig(defaultConfig, config));
```

- [ ] **Step 2: android/app/build.gradle — sentry.gradle 적용**

`apply plugin: "com.facebook.react"` 라인 바로 아래에 추가:

```gradle
/* 릴리즈 번들 생성 시 소스맵을 Sentry로 업로드한다. SENTRY_DISABLE_AUTO_UPLOAD=true면 건너뛴다 */
apply from: new File(["node", "--print", "require.resolve('@sentry/react-native/package.json')"].execute(null, rootDir).text.trim(), "../sentry.gradle")
```

- [ ] **Step 3: pbxproj — Bundle RN 페이즈를 sentry-xcode.sh로 래핑**

`00DD1BFF1BD5951E006B06BC` 블록의 `shellScript`를 다음으로 교체:

```
shellScript = "set -e\n\nWITH_ENVIRONMENT=\"../node_modules/react-native/scripts/xcode/with-environment.sh\"\nREACT_NATIVE_XCODE=\"../node_modules/react-native/scripts/react-native-xcode.sh\"\nSENTRY_XCODE=\"../node_modules/@sentry/react-native/scripts/sentry-xcode.sh\"\n\n/bin/sh -c \"$WITH_ENVIRONMENT \\\"/bin/sh $SENTRY_XCODE $REACT_NATIVE_XCODE\\\"\"\n";
```

- [ ] **Step 4: pbxproj — dSYM 업로드 페이즈 추가**

`PBXShellScriptBuildPhase` 섹션에 새 블록 추가(기존 블록들과 같은 들여쓰기):

```
		A1B2C3D4E5F60718293A4B5C /* Upload Debug Symbols to Sentry */ = {
			isa = PBXShellScriptBuildPhase;
			buildActionMask = 2147483647;
			files = (
			);
			inputPaths = (
			);
			name = "Upload Debug Symbols to Sentry";
			outputPaths = (
			);
			runOnlyForDeploymentPostprocessing = 0;
			shellPath = /bin/sh;
			shellScript = "if [ \"$CONFIGURATION\" = \"Release\" ]; then\n  /bin/sh ../node_modules/@sentry/react-native/scripts/sentry-xcode-debug-files.sh\nfi\n";
		};
```

타깃 `13B07F861A680F5B00A75B9A`의 `buildPhases` 목록 **마지막**(`[CP-User] [RNFB] Core Configuration` 다음)에 추가:

```
				A1B2C3D4E5F60718293A4B5C /* Upload Debug Symbols to Sentry */,
```

- [ ] **Step 5: 프로젝트 파일 무결성·dSYM 설정 확인**

```bash
plutil -lint ios/LetMeDoWith.xcodeproj/project.pbxproj
cd ios && xcodebuild -workspace LetMeDoWith.xcworkspace -scheme LetMeDoWith -configuration Release -showBuildSettings 2>/dev/null | grep DEBUG_INFORMATION_FORMAT
```

Expected: `OK` + `DEBUG_INFORMATION_FORMAT = dwarf-with-dsym` (pbxproj에 override가 없어 Xcode Release 기본값이 적용된다. 다르게 나오면 Release 빌드 설정에 `DEBUG_INFORMATION_FORMAT = "dwarf-with-dsym"` 추가)

- [ ] **Step 6: Metro 번들 생성 확인** (업로드 없이 설정만 검증)

```bash
SENTRY_DISABLE_AUTO_UPLOAD=true npx react-native bundle --platform android --dev false \
  --entry-file index.js --bundle-output /tmp/sentry-check.bundle --sourcemap-output /tmp/sentry-check.map
grep -c "debugId" /tmp/sentry-check.map
```

Expected: 번들 성공, debugId 1건 이상

- [ ] **Step 7: Commit**

```bash
git add metro.config.js android/app/build.gradle ios/LetMeDoWith.xcodeproj/project.pbxproj
git commit -m "feat: 릴리즈 빌드에 Sentry 소스맵·dSYM 업로드 연결"
```

---

### Task 6: CI — 업로드 토글과 토큰 주입

**Files:**

- Modify: `.github/workflows/build-apps.yml`, `.github/workflows/distribute-dev.yml`, `.github/workflows/verify-build.yml`

**Interfaces:**

- Consumes: `SENTRY_DISABLE_AUTO_UPLOAD` 동작(Task 5), GitHub 시크릿 `SENTRY_AUTH_TOKEN`(사용자가 등록)

- [ ] **Step 1: build-apps.yml — input 추가** (`upload-artifacts` input 아래)

```yaml
upload-sourcemaps:
  description: 'Sentry 소스맵·심볼 업로드 여부 (실배포만 true — 실패 시 빌드도 실패한다)'
  type: boolean
  default: false
```

- [ ] **Step 2: build-apps.yml — Android 빌드 스텝에 env 추가**

```yaml
- name: Android Release 빌드
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_DISABLE_AUTO_UPLOAD: ${{ inputs.upload-sourcemaps && 'false' || 'true' }}
  run: cd android && ./gradlew assembleRelease --no-daemon
```

- [ ] **Step 3: build-apps.yml — iOS Archive 스텝에 같은 env 추가**

`- name: Archive` 스텝에 동일한 `env:` 블록(`SENTRY_AUTH_TOKEN`, `SENTRY_DISABLE_AUTO_UPLOAD`)을 추가한다. (업로드는 Archive의 번들·dSYM 페이즈에서 일어난다 — Export IPA에는 불필요)

- [ ] **Step 4: 호출부 — distribute-dev는 켜고 verify-build는 끈다**

`distribute-dev.yml`의 `with:` 블록에 추가:

```yaml
# 실배포 빌드는 소스맵이 없으면 스택 해석이 안 되므로 업로드 실패 시 빌드도 실패시킨다.
upload-sourcemaps: true
```

`verify-build.yml`의 `with:` 블록에 추가:

```yaml
# 검증 빌드는 배포되지 않으므로 업로드하지 않는다.
upload-sourcemaps: false
```

- [ ] **Step 5: 문법 검증 후 Commit**

Run: `python3 -c "import yaml,glob; [yaml.safe_load(open(f)) for f in glob.glob('.github/workflows/*.yml')]" && echo ok`
Expected: ok

```bash
git add .github/workflows/build-apps.yml .github/workflows/distribute-dev.yml .github/workflows/verify-build.yml
git commit -m "ci: 배포 빌드에서만 Sentry 소스맵 업로드"
```

---

### Task 7: 개발자도구 Sentry 테스트 버튼

**Files:**

- Modify: `src/components/__dev__/tabs/ElementsTab.tsx`

**Interfaces:**

- Consumes: `queryClient`(`services/queryClient`), `apiClient`(`services/apiClient`), `Sentry.nativeCrash`

- [ ] **Step 1: ElementsTab에 Sentry 섹션 추가** — "App" 섹션 `</View>` 닫힌 직후

```tsx
{
  /* Sentry 전송 테스트 — Metro(__DEV__) 빌드는 전송이 꺼져 있어 dev 릴리즈 빌드에서만 실제 전송된다 */
}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Sentry</Text>
  <View style={[styles.card, styles.sentryButtons]}>
    <DevToolsButton
      label="JS Error"
      doneLabel="Thrown"
      onPress={() => {
        /* 핸들러 안에서 throw하면 React가 삼킨다 — 전역 핸들러로 보내기 위해 틱을 넘긴다 */
        setTimeout(() => {
          throw new Error('[DevTools] Sentry JS 에러 테스트');
        }, 0);
      }}
    />
    <DevToolsButton
      label="API Error"
      doneLabel="Sent"
      color="#E5C07B"
      onPress={() =>
        /* 존재하지 않는 엔드포인트 → 404 → 전역 에러 구독 → captureApiError(warning) 경로 검증 */
        queryClient
          .fetchQuery({
            queryKey: ['__dev__', 'sentry-test', Date.now()],
            queryFn: () => apiClient.get('v1/__dev__/sentry-test'),
            retry: false,
          })
          .catch(() => {})
      }
    />
    <DevToolsButton label="Native Crash" doneLabel="…" color="#C678DD" onPress={() => Sentry.nativeCrash()} />
  </View>
</View>;
```

상단 import 추가:

```ts
import * as Sentry from '@sentry/react-native';
import { queryClient } from 'services/queryClient';
import { apiClient } from 'services/apiClient';
```

스타일에 추가:

```ts
sentryButtons: {
  flexDirection: 'row',
  gap: 8,
},
```

- [ ] **Step 2: 검증 후 Commit**

Run: `npx tsc --noEmit && npx eslint src/components/__dev__/tabs/ElementsTab.tsx`
Expected: 에러 0

```bash
npx prettier --write src/components/__dev__/tabs/ElementsTab.tsx
git add src/components/__dev__/tabs/ElementsTab.tsx
git commit -m "feat: 개발자도구에 Sentry 테스트 버튼 추가"
```

---

### Task 8: 문서화 + 전체 검증

**Files:**

- Modify: `.claude/rules/dev-environment.md`

- [ ] **Step 1: dev-environment.md에 Sentry 절 추가** (patch-package 절 앞)

````markdown
## Sentry

- 에러·성능 로직은 **전부 `utils/sentry.ts`에 모여 있다.** 화면·훅에 Sentry 호출을 흩뿌리지 않는다. API 에러는 App.tsx의 전역 에러 구독 한 곳에서만 수집한다.
- 전송 게이트는 `__DEV__`만이다(Analytics와 동일). Metro 빌드는 기록되지 않고, dev 배포 빌드는 `environment=development`로 전송된다. 동작 확인은 개발자도구 Elements 탭의 Sentry 테스트 버튼 + dev 릴리즈 빌드로 한다.
- **소스맵·dSYM 업로드**는 릴리즈 빌드 중 자동 실행된다. 로컬에서 업로드하려면 `~/.sentryclirc`에 토큰을 둔다:

  ```ini
  [auth]
  token=<sentry.io → Settings → Auth Tokens에서 발급>
  ```
````

토큰이 없거나 업로드를 생략하려면 `SENTRY_DISABLE_AUTO_UPLOAD=true`를 붙여 빌드한다(빌드는 깨지지 않는다). CI는 distribute-dev에서만 업로드하며 실패 시 빌드가 실패한다.

- `SENTRY_DSN`은 `.env` 키다(클라이언트 공개값). 키 추가 시 `react-native-config.d.ts`도 함께 갱신하는 규칙은 그대로 적용된다.

````

- [ ] **Step 2: 전체 검증**

```bash
npx prettier --check . 2>/dev/null | tail -3
npx eslint . 2>&1 | tail -3
npx tsc --noEmit
npx jest
````

Expected: eslint 에러 0(경고 무방), tsc 0, jest 전체 통과

- [ ] **Step 3: 로컬 dev 빌드 1회 (오래 걸림 — 실행 전 사용자 확인)**

```bash
SENTRY_DISABLE_AUTO_UPLOAD=true yarn build:dev:android
```

Expected: BUILD SUCCESSFUL, `.env`의 ENABLE_DEVTOOLS가 false로 원복. 이후 에뮬레이터에 설치해 Sentry 테스트 버튼 3종 → Sentry 콘솔 이슈 생성 확인(소스맵 업로드는 토큰 설정 후 별도 확인).

- [ ] **Step 4: Commit**

```bash
git add .claude/rules/dev-environment.md
git commit -m "docs: 개발 환경 지침에 Sentry 절 추가"
```

---

## 계획 밖(사용자 직접 수행)

- GitHub 시크릿 `SENTRY_AUTH_TOKEN` 등록, `ENV_FILE` 시크릿에 `SENTRY_DSN=` 라인 추가
- Sentry 콘솔 알림 규칙: ① 새 이슈(level ≥ error) ② 영향 사용자 3명 이상/1시간, 알림 채널 연결
- 로컬 업로드용 `~/.sentryclirc` 토큰 발급·설정
- 소스맵·dSYM·분산 추적·크래시 프리 세션 확인은 다음 dev 배포(distribute-dev) 후 Sentry 콘솔에서
