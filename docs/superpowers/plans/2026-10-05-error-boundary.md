# 에러 바운더리 · 에러 화면 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 화면 렌더 에러와 화면 핵심 데이터의 첫 로딩 실패를 시안의 에러 화면(네트워크/데이터)으로 대체하고 "다시 시도하기"로 복구하게 한다.

**Architecture:** 모든 화면을 `withScreenErrorBoundary`로 감싸고, 화면 핵심 조회만 `throwOnError: throwOnInitialError`로 바운더리에 던진다. 바운더리는 `QueryErrorResetBoundary`로 재시도 시 실패 조회를 다시 요청한다. 바텀시트는 내용 바운더리(닫고 스낵바), 화면 바깥은 루트 `Sentry.ErrorBoundary`가 받는다.

**Tech Stack:** React Native 0.73, TypeScript, @tanstack/react-query v5, @sentry/react-native v7, axios, jest + react-test-renderer

**Spec:** `docs/superpowers/specs/2026-10-05-error-boundary-design.md`

## Global Constraints

- **커밋·`git add` 금지.** 각 태스크는 워킹 트리에 변경을 남기고 끝낸다(CLAUDE.md Git 규칙). 서브에이전트도 동일.
- 새 의존성 추가 금지(react-error-boundary 등). 바운더리는 직접 만든 클래스 컴포넌트.
- 색·타이포는 `theme` 토큰만(hex 금지). 여러 줄 설명 주석은 `/* */`. import는 경로 별칭. named export.
- Sentry 호출은 `utils/sentry.ts`에만 둔다.
- 문구(그대로 사용):
  - NETWORK 제목 `인터넷 연결을 확인해주세요.` / 설명 `연결이 잠시 끊겼어요.\n인터넷 연결을 확인하고 다시 시도해 주세요.`
  - DEFAULT 제목 `데이터를 불러오지 못했어요.` / 설명 `불러오기에 실패했어요.\n잠시 후 다시 시도해 주세요.`
  - 버튼 `다시 시도하기`
  - 바텀시트 에러 스낵바 `앗 잠시 문제가 생겼어요. 다시 시도해 주세요.`
- 일러스트: 172×100 고정. `~/Downloads/Frame 1739338927.png` → `assets/images/error_network@3x.png`, `~/Downloads/Frame 1739338927 (1).png` → `assets/images/error_data@3x.png` (각 516×300 투명 PNG, @3x 한 장만).
- 토큰 만료(E302) 조회 에러는 바운더리로 던지지 않는다.
- 각 태스크 끝에 `npx tsc --noEmit -p .`, 바꾼 파일에 `npx prettier --write` + `npx eslint`, `npx jest` 전체 통과.

## Review Focus

1. **같은 조회를 핵심/부가로 동시에 구독** (예: 내 정보 — 마이도리는 핵심, 홈은 부가, 두 탭 모두 마운트) → 실패 시 핵심 화면만 에러 화면, 부가 화면은 유지. 스낵바는 하나라도 던지는 구독이 있으면 생략. → Task 1 `isThrownToBoundary` 테스트.
2. **데이터가 있는 상태의 다시 받기 실패** (5분 자동 갱신·새로고침) → 던지지 않고 화면 유지, 스낵바 판단도 기존대로. → Task 1 테스트.
3. **E302로 첫 로딩 실패** → 던지지 않음(재발급 후 재요청으로 회복). → Task 1 테스트.
4. **다시 시도했는데 또 실패** → 에러 화면이 다시 떠야 함(빈 화면·무한 로딩 금지). → Task 4 테스트.
5. **바텀시트 내용 렌더 에러** → 앱이 하얗게 죽지 않고 시트가 닫히며 스낵바. → Task 6 테스트.

---

## File Structure

| 파일 | 책임 |
|---|---|
| `src/utils/error.ts` (신규) | 에러 종류 판별, `throwOnInitialError`, 조회 옵션 변환, 전역 구독용 `isThrownToBoundary` (순수 함수) |
| `src/utils/sentry.ts` (수정) | `captureRenderError` 추가 |
| `src/components/common/ErrorFallback/index.tsx` (신규) | 에러 화면 UI (Provider 비의존) |
| `src/components/common/ScreenErrorBoundary/index.tsx` (신규) | 화면 바운더리 + `withScreenErrorBoundary` HOC |
| `src/components/common/BottomSheet/SheetContentBoundary.tsx` (신규) | 시트 내용 바운더리 |
| `src/components/common/BottomSheet/index.tsx` (수정) | children을 `SheetContentBoundary`로 감쌈 |
| `App.tsx` (수정) | 스낵바 생략, 루트 `Sentry.ErrorBoundary`, 로그인 바운더리 |
| 네비게이터 7곳 + `screens/Notification` (수정) | leaf 화면을 HOC로 감쌈 |
| 조회 훅 11개 + 화면 (수정) | `throwOnError` 옵션, 핵심 화면에서 켬 |
| `jest.config.js`, `__mocks__/fileMock.js` | png import 모킹 |
| `.claude/rules/*.md` | 새 규칙 기록 |

---

### Task 1: 에러 유틸 (`utils/error.ts`)

**Files:**
- Create: `src/utils/error.ts`
- Test: `src/utils/__tests__/error.test.ts`

**Interfaces:**
- Produces:
  - `type ErrorVariant = 'NETWORK' | 'DEFAULT'`
  - `getErrorVariant(error: unknown): ErrorVariant`
  - `throwOnInitialError(error: unknown, query: { state: { data: unknown } }): boolean`
  - `interface BoundaryQueryOptions { throwOnError?: boolean }`
  - `toThrowOnError(enabled?: boolean): typeof throwOnInitialError | false`
  - `isThrownToBoundary(event: QueryCacheNotifyEvent | MutationCacheNotifyEvent): boolean`

- [ ] **Step 1: 실패하는 테스트 작성** — `src/utils/__tests__/error.test.ts`

```ts
/*
 * 에러 바운더리 판단 유틸 테스트.
 * axios 에러는 isAxiosError가 보는 플래그만 맞춘 객체로 만든다.
 */
import { describe, it, expect } from '@jest/globals';
import type { MutationCacheNotifyEvent, QueryCacheNotifyEvent } from '@tanstack/react-query';

import { getErrorVariant, isThrownToBoundary, throwOnInitialError, toThrowOnError } from 'utils/error';

const axiosError = (response?: { status: number; data?: { statusCode?: string } }) =>
  Object.assign(new Error('axios'), { isAxiosError: true, response });

const query = (data: unknown) => ({ state: { data } });

describe('getErrorVariant', () => {
  it('응답 없는 axios 에러는 NETWORK', () => {
    expect(getErrorVariant(axiosError())).toBe('NETWORK');
  });

  it('응답 있는 axios 에러는 DEFAULT', () => {
    expect(getErrorVariant(axiosError({ status: 500 }))).toBe('DEFAULT');
  });

  it('일반 Error(렌더 에러)는 DEFAULT', () => {
    expect(getErrorVariant(new TypeError('x'))).toBe('DEFAULT');
  });
});

describe('throwOnInitialError', () => {
  it('데이터가 없으면 던진다', () => {
    expect(throwOnInitialError(axiosError({ status: 500 }), query(undefined))).toBe(true);
  });

  it('데이터가 있으면(다시 받기 실패) 던지지 않는다', () => {
    expect(throwOnInitialError(axiosError({ status: 500 }), query({ items: [] }))).toBe(false);
  });

  it('E302(토큰 만료)는 데이터가 없어도 던지지 않는다', () => {
    expect(throwOnInitialError(axiosError({ status: 401, data: { statusCode: 'E302' } }), query(undefined))).toBe(
      false,
    );
  });
});

describe('toThrowOnError', () => {
  it('켜면 throwOnInitialError, 끄거나 생략하면 false', () => {
    expect(toThrowOnError(true)).toBe(throwOnInitialError);
    expect(toThrowOnError(false)).toBe(false);
    expect(toThrowOnError()).toBe(false);
  });
});

describe('isThrownToBoundary', () => {
  const errorEvent = (data: unknown, observerOptions: { throwOnError?: unknown }[]) =>
    ({
      type: 'updated',
      action: { type: 'error', error: axiosError({ status: 500 }) },
      query: { state: { data }, observers: observerOptions.map(options => ({ options })) },
    }) as unknown as QueryCacheNotifyEvent;

  it('throwOnInitialError 구독이 하나라도 있고 데이터가 없으면 true', () => {
    expect(isThrownToBoundary(errorEvent(undefined, [{}, { throwOnError: throwOnInitialError }]))).toBe(true);
  });

  it('모든 구독이 던지지 않으면 false', () => {
    expect(isThrownToBoundary(errorEvent(undefined, [{}, { throwOnError: false }]))).toBe(false);
  });

  it('데이터가 있으면(다시 받기 실패) false', () => {
    expect(isThrownToBoundary(errorEvent({ items: [] }, [{ throwOnError: throwOnInitialError }]))).toBe(false);
  });

  it('boolean true 구독이면 true', () => {
    expect(isThrownToBoundary(errorEvent(undefined, [{ throwOnError: true }]))).toBe(true);
  });

  it('mutation 이벤트는 false', () => {
    const mutationEvent = {
      type: 'updated',
      action: { type: 'error', error: axiosError({ status: 500 }) },
      mutation: {},
    } as unknown as MutationCacheNotifyEvent;
    expect(isThrownToBoundary(mutationEvent)).toBe(false);
  });
});
```

- [ ] **Step 2: 실패 확인** — `npx jest src/utils/__tests__/error.test.ts` → `Cannot find module 'utils/error'`로 FAIL.

- [ ] **Step 3: 구현** — `src/utils/error.ts`

```ts
import axios from 'axios';
import type { MutationCacheNotifyEvent, QueryCacheNotifyEvent } from '@tanstack/react-query';

import { ErrorStatusCodeEnum } from 'schemes/shared/enum';
import type { BaseResponseSchemeType } from 'types/shared/scheme/api';

/* 에러 화면 종류. 응답 자체가 없으면 연결 문제, 나머지(서버 에러·렌더 에러)는 데이터 실패로 안내한다. */
type ErrorVariant = 'NETWORK' | 'DEFAULT';

const getErrorVariant = (error: unknown): ErrorVariant =>
  axios.isAxiosError(error) && !error.response ? 'NETWORK' : 'DEFAULT';

const isTokenExpiredError = (error: unknown) =>
  axios.isAxiosError<BaseResponseSchemeType>(error) &&
  error.response?.data?.statusCode === ErrorStatusCodeEnum.enum.E302;

/*
 * 화면 핵심 조회의 throwOnError. 보여줄 데이터가 하나도 없을 때만 화면 에러 바운더리로 던진다.
 * - 데이터가 있는 상태의 다시 받기(자동 갱신·새로고침) 실패는 던지지 않는다 — 보던 화면을 유지한다.
 * - E302(토큰 만료)는 App.tsx 전역 구독이 재발급 후 다시 요청하므로 던지지 않는다.
 *   던지면 재발급 뒤 요청이 성공해도 에러 화면이 남는다.
 */
const throwOnInitialError = (error: unknown, query: { state: { data: unknown } }) =>
  query.state.data === undefined && !isTokenExpiredError(error);

/* 조회 훅 공통 옵션. 같은 훅이 화면마다 핵심/부가가 달라 부르는 쪽에서 켠다. */
interface BoundaryQueryOptions {
  /* 이 화면의 핵심 데이터일 때 켠다 — 첫 로딩 실패 시 화면 전체를 에러 화면으로 바꾼다 */
  throwOnError?: boolean;
}

const toThrowOnError = (enabled?: boolean) => (enabled ? throwOnInitialError : false);

/*
 * 전역 에러 구독에서, 이 조회 에러를 화면 에러 바운더리가 띄우는지 판단한다(공통 스낵바 생략용).
 * 같은 조회를 여러 화면이 다른 옵션으로 구독할 수 있어, 구독 중 하나라도 던지면 true다.
 */
const isThrownToBoundary = (event: QueryCacheNotifyEvent | MutationCacheNotifyEvent) => {
  if (!('query' in event) || event.type !== 'updated' || event.action.type !== 'error') {
    return false;
  }

  const { query } = event;
  const { error } = event.action;

  return query.observers.some(observer => {
    const { throwOnError } = observer.options;
    return typeof throwOnError === 'function' ? throwOnError(error, query) : Boolean(throwOnError);
  });
};

export { getErrorVariant, throwOnInitialError, toThrowOnError, isThrownToBoundary };
export type { ErrorVariant, BoundaryQueryOptions };
```

- [ ] **Step 4: 통과 확인** — `npx jest src/utils/__tests__/error.test.ts` → PASS. `npx tsc --noEmit -p .` 에러 없음.
- [ ] **Step 5: prettier·eslint (커밋하지 않음)**

---

### Task 2: 렌더 에러 수집 (`captureRenderError`)

**Files:**
- Modify: `src/utils/sentry.ts` (`captureHandledError` 아래에 추가, export 목록에 추가)
- Test: `src/utils/__tests__/sentry.test.ts` (기존 파일에 describe 추가, 기존 모킹 재사용)

**Interfaces:**
- Produces: `captureRenderError(error: unknown, boundary: 'screen' | 'bottom-sheet'): void`

- [ ] **Step 1: 실패하는 테스트 추가** — 기존 import 목록에 `captureRenderError` 추가 후 파일 끝에:

```ts
describe('captureRenderError', () => {
  beforeEach(() => {
    mockCaptureException.mockClear();
  });

  it('렌더 에러는 boundary 태그와 함께 보낸다', () => {
    const error = new TypeError('render');
    captureRenderError(error, 'screen');
    expect(mockCaptureException).toHaveBeenCalledWith(error, { tags: { boundary: 'screen' } });
  });

  it('axios 에러는 전역 구독이 수집하므로 보내지 않는다', () => {
    captureRenderError(Object.assign(new Error('axios'), { isAxiosError: true }), 'bottom-sheet');
    expect(mockCaptureException).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: 실패 확인** — `npx jest src/utils/__tests__/sentry.test.ts` → `captureRenderError is not a function` FAIL.
- [ ] **Step 3: 구현** — `src/utils/sentry.ts`

```ts
/*
 * 에러 바운더리가 잡은 렌더 에러를 보고한다.
 * 바운더리로 던져진 API 에러(axios)는 App.tsx 전역 구독이 이미 수집하므로 보내지 않는다(중복 방지).
 */
const captureRenderError = (error: unknown, boundary: 'screen' | 'bottom-sheet') => {
  if (axios.isAxiosError(error)) {
    return;
  }

  Sentry.captureException(error, { tags: { boundary } });
};
```

export 목록에 `captureRenderError` 추가.

- [ ] **Step 4: 통과 확인** — `npx jest src/utils/__tests__/sentry.test.ts` PASS.
- [ ] **Step 5: prettier·eslint·tsc (커밋하지 않음)**

---

### Task 3: 에러 화면 UI (`ErrorFallback`) + 일러스트

**Files:**
- Create: `assets/images/error_network@3x.png`, `assets/images/error_data@3x.png` (복사)
- Create: `__mocks__/fileMock.js`
- Modify: `jest.config.js`
- Create: `src/components/common/ErrorFallback/index.tsx`
- Test: `src/components/common/ErrorFallback/__tests__/ErrorFallback.test.tsx`

**Interfaces:**
- Consumes: `ErrorVariant` (Task 1)
- Produces: `ErrorFallback({ variant, onRetry, withSafeAreaTop? })` — 버튼 `testID="error-fallback-retry"`

- [ ] **Step 1: 에셋 복사와 jest 모킹**

```bash
cp ~/Downloads/"Frame 1739338927.png" assets/images/error_network@3x.png
cp ~/Downloads/"Frame 1739338927 (1).png" assets/images/error_data@3x.png
```

`__mocks__/fileMock.js`:

```js
/* 이미지 import를 jest에서 숫자 리소스 ID처럼 다룬다(@3x만 있는 에셋은 jest 리졸버가 찾지 못한다) */
module.exports = 1;
```

`jest.config.js` `moduleNameMapper`에 추가:

```js
    '\\.png$': '<rootDir>/__mocks__/fileMock.js',
```

png 타입 선언 존재 확인: `grep -rn "declare module '\*.png'" src *.d.ts` — 없으면 기존 `nag_complete.png` import가 쓰는 선언 파일에 맞춰 둔다(이미 있을 것으로 예상, 없으면 `src/types/assets.d.ts`에 `declare module '*.png' { const value: number; export default value; }` 추가).

- [ ] **Step 2: 실패하는 테스트 작성**

```tsx
/*
 * 에러 화면 문구·재시도·안전 영역 분기 테스트.
 * 루트 대체 화면은 Provider 밖에서도 그려지므로 Provider 없이 렌더한다.
 */
import { describe, it, expect, jest } from '@jest/globals';
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text, View } from 'react-native';

jest.mock('react-native-safe-area-context', () => ({
  initialWindowMetrics: { insets: { top: 47, bottom: 34, left: 0, right: 0 }, frame: { x: 0, y: 0, width: 0, height: 0 } },
}));

import { ErrorFallback } from 'components/common/ErrorFallback';

const texts = (tree: renderer.ReactTestRenderer) =>
  tree.root.findAllByType(Text).map(node => node.props.children as string);

describe('ErrorFallback', () => {
  it('NETWORK 문구를 보여준다', () => {
    const tree = renderer.create(<ErrorFallback variant="NETWORK" onRetry={jest.fn()} />);
    expect(texts(tree)).toEqual(
      expect.arrayContaining(['인터넷 연결을 확인해주세요.', '연결이 잠시 끊겼어요.\n인터넷 연결을 확인하고 다시 시도해 주세요.', '다시 시도하기']),
    );
  });

  it('DEFAULT 문구를 보여준다', () => {
    const tree = renderer.create(<ErrorFallback variant="DEFAULT" onRetry={jest.fn()} />);
    expect(texts(tree)).toEqual(
      expect.arrayContaining(['데이터를 불러오지 못했어요.', '불러오기에 실패했어요.\n잠시 후 다시 시도해 주세요.']),
    );
  });

  it('다시 시도하기를 누르면 onRetry를 부른다', () => {
    const onRetry = jest.fn();
    const tree = renderer.create(<ErrorFallback variant="DEFAULT" onRetry={onRetry} />);
    act(() => {
      tree.root.findByProps({ testID: 'error-fallback-retry' }).props.onPress();
    });
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('withSafeAreaTop이면 상단 안전 영역만큼 여백을 둔다', () => {
    const tree = renderer.create(<ErrorFallback variant="DEFAULT" onRetry={jest.fn()} withSafeAreaTop />);
    const container = tree.root.findAllByType(View)[0];
    expect(container.props.style).toEqual(expect.arrayContaining([{ paddingTop: 47 }]));
  });
});
```

- [ ] **Step 3: 실패 확인** — `npx jest src/components/common/ErrorFallback` FAIL(모듈 없음).
- [ ] **Step 4: 구현** — `src/components/common/ErrorFallback/index.tsx`

```tsx
import React from 'react';
import { Image, type ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';

import { theme } from 'styles/theme';
import type { ErrorVariant } from 'utils/error';

import errorNetworkImage from 'assets/images/error_network.png';
import errorDataImage from 'assets/images/error_data.png';

const CONTENT: Record<ErrorVariant, { image: ImageSourcePropType; title: string; description: string }> = {
  NETWORK: {
    image: errorNetworkImage,
    title: '인터넷 연결을 확인해주세요.',
    description: '연결이 잠시 끊겼어요.\n인터넷 연결을 확인하고 다시 시도해 주세요.',
  },
  DEFAULT: {
    image: errorDataImage,
    title: '데이터를 불러오지 못했어요.',
    description: '불러오기에 실패했어요.\n잠시 후 다시 시도해 주세요.',
  },
};

/*
 * 앱 시작 시점의 상단 안전 영역. 루트 대체 화면은 SafeAreaProvider 밖에서 그려져 훅을 쓸 수 없으므로
 * Provider 없이 읽을 수 있는 초기값을 쓴다(회전을 지원하지 않아 값이 바뀌지 않는다).
 */
const SAFE_AREA_TOP = initialWindowMetrics?.insets.top ?? 0;

interface Props {
  variant: ErrorVariant;
  onRetry: () => void;
  /* 네비게이터 헤더 없이 화면 맨 위부터 덮을 때(홈·로그인·루트 대체 화면) 노치만큼 내려 가운데를 맞춘다 */
  withSafeAreaTop?: boolean;
}

/*
 * 화면 렌더 에러·핵심 데이터 첫 로딩 실패 시 화면 내용 자리를 대신하는 에러 화면.
 * 네비게이터 헤더·탭바를 뺀 영역의 정중앙에 놓는다.
 * 루트 대체 화면으로도 쓰이므로 Provider 컨텍스트(테마 훅·안전 영역 훅·다이얼로그)를 쓰지 않는다.
 */
const ErrorFallback = ({ variant, onRetry, withSafeAreaTop = false }: Props) => {
  const { image, title, description } = CONTENT[variant];

  return (
    <View style={[styles.container, withSafeAreaTop && { paddingTop: SAFE_AREA_TOP }]}>
      <Image source={image} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Pressable testID="error-fallback-retry" style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryText}>다시 시도하기</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
  },
  image: {
    width: 172,
    height: 100,
  },
  title: {
    ...theme.TYPOGRAPHY.TITLE_3,
    marginTop: 24,
    textAlign: 'center',
  },
  description: {
    ...theme.TYPOGRAPHY.BODY_2,
    color: theme.COLORS.GRAY_SCALE.GRAY_50,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    height: 48,
    paddingHorizontal: 28,
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_92,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
  },
  retryText: {
    ...theme.TYPOGRAPHY.BODY_1,
    color: theme.COLORS.DEFAULT.BLACK,
  },
});

export { ErrorFallback };
```

- [ ] **Step 5: 통과 확인** — `npx jest src/components/common/ErrorFallback` PASS, `npx jest` 전체 PASS(moduleNameMapper가 기존 png 테스트를 깨지 않는지).
- [ ] **Step 6: prettier·eslint·tsc (커밋하지 않음)**

---

### Task 4: 화면 바운더리 (`ScreenErrorBoundary`, `withScreenErrorBoundary`)

**Files:**
- Create: `src/components/common/ScreenErrorBoundary/index.tsx`
- Test: `src/components/common/ScreenErrorBoundary/__tests__/ScreenErrorBoundary.test.tsx`

**Interfaces:**
- Consumes: `getErrorVariant` (Task 1), `captureRenderError` (Task 2), `ErrorFallback` (Task 3)
- Produces:
  - `ScreenErrorBoundary({ children, withSafeAreaTop? })`
  - `withScreenErrorBoundary<P extends object>(Screen: ComponentType<P>, options?: { withSafeAreaTop?: boolean }): ComponentType<P>`

- [ ] **Step 1: 실패하는 테스트 작성**

```tsx
/*
 * 화면 바운더리: 에러 화면 전환·재시도·수집 분기 테스트.
 * React가 잡은 에러를 console.error로 찍으므로 테스트 동안 막는다.
 */
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';

const mockCaptureRenderError = jest.fn();
jest.mock('utils/sentry', () => ({
  captureRenderError: (...args: unknown[]) => mockCaptureRenderError(...args),
}));
jest.mock('react-native-safe-area-context', () => ({ initialWindowMetrics: null }));

import { ErrorFallback } from 'components/common/ErrorFallback';
import { ScreenErrorBoundary, withScreenErrorBoundary } from 'components/common/ScreenErrorBoundary';

let shouldThrow: unknown = null;
const Child = () => {
  if (shouldThrow) {
    throw shouldThrow;
  }
  return <Text>content</Text>;
};

const pressRetry = (tree: renderer.ReactTestRenderer) =>
  act(() => {
    tree.root.findByProps({ testID: 'error-fallback-retry' }).props.onPress();
  });

describe('ScreenErrorBoundary', () => {
  let consoleSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    mockCaptureRenderError.mockClear();
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    shouldThrow = null;
  });

  it('자식이 렌더 에러를 던지면 DEFAULT 에러 화면을 보이고 수집한다', () => {
    shouldThrow = new TypeError('render');
    const tree = renderer.create(
      <ScreenErrorBoundary>
        <Child />
      </ScreenErrorBoundary>,
    );
    expect(tree.root.findByType(ErrorFallback).props.variant).toBe('DEFAULT');
    expect(mockCaptureRenderError).toHaveBeenCalledWith(shouldThrow, 'screen');
  });

  it('응답 없는 axios 에러는 NETWORK 화면', () => {
    shouldThrow = Object.assign(new Error('Network Error'), { isAxiosError: true });
    const tree = renderer.create(
      <ScreenErrorBoundary>
        <Child />
      </ScreenErrorBoundary>,
    );
    expect(tree.root.findByType(ErrorFallback).props.variant).toBe('NETWORK');
  });

  it('다시 시도하면 자식을 다시 그린다', () => {
    shouldThrow = new TypeError('render');
    const tree = renderer.create(
      <ScreenErrorBoundary>
        <Child />
      </ScreenErrorBoundary>,
    );
    shouldThrow = null;
    pressRetry(tree);
    expect(tree.root.findAllByType(ErrorFallback)).toHaveLength(0);
    expect(tree.root.findByType(Text).props.children).toBe('content');
  });

  it('다시 시도했는데 또 실패하면 에러 화면이 다시 뜬다', () => {
    shouldThrow = new TypeError('render');
    const tree = renderer.create(
      <ScreenErrorBoundary>
        <Child />
      </ScreenErrorBoundary>,
    );
    pressRetry(tree);
    expect(tree.root.findAllByType(ErrorFallback)).toHaveLength(1);
  });

  it('withScreenErrorBoundary는 props를 그대로 넘기고 safe area 옵션을 전달한다', () => {
    const Screen = ({ label }: { label: string }) => <Text>{label}</Text>;
    const Wrapped = withScreenErrorBoundary(Screen, { withSafeAreaTop: true });
    const tree = renderer.create(<Wrapped label="hello" />);
    expect(tree.root.findByType(Text).props.children).toBe('hello');
    expect(Wrapped.displayName).toBe('withScreenErrorBoundary(Screen)');
  });
});
```

- [ ] **Step 2: 실패 확인** — `npx jest src/components/common/ScreenErrorBoundary` FAIL.
- [ ] **Step 3: 구현** — `src/components/common/ScreenErrorBoundary/index.tsx`

```tsx
import React, { Component, type ComponentType, type ReactNode } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';

import { ErrorFallback } from 'components/common/ErrorFallback';
import { getErrorVariant } from 'utils/error';
import { captureRenderError } from 'utils/sentry';

interface BoundaryProps {
  /* QueryErrorResetBoundary의 reset. 재시도 때 실패했던 조회를 다시 요청하게 한다 */
  onReset: () => void;
  withSafeAreaTop?: boolean;
  children: ReactNode;
}

interface BoundaryState {
  hasError: boolean;
  error: unknown;
}

class Boundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: unknown): BoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown) {
    captureRenderError(error, 'screen');
  }

  handleRetry = () => {
    this.props.onReset();
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          variant={getErrorVariant(this.state.error)}
          onRetry={this.handleRetry}
          withSafeAreaTop={this.props.withSafeAreaTop}
        />
      );
    }

    return this.props.children;
  }
}

interface Props {
  children: ReactNode;
  withSafeAreaTop?: boolean;
}

/*
 * 화면 단위 에러 바운더리. 렌더 에러와, 핵심 조회가 첫 로딩에 실패해 던진 에러(throwOnInitialError)를 받아
 * 화면 내용 자리를 에러 화면으로 바꾼다. 네비게이터 헤더·탭바는 바깥이라 그대로 남는다.
 */
const ScreenErrorBoundary = ({ children, withSafeAreaTop }: Props) => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <Boundary onReset={reset} withSafeAreaTop={withSafeAreaTop}>
        {children}
      </Boundary>
    )}
  </QueryErrorResetBoundary>
);

/*
 * 네비게이터 등록부에서 화면을 감싼다. 반드시 모듈 레벨에서 한 번만 호출한다 —
 * 렌더 중에 호출하면 매번 새 컴포넌트 타입이 되어 화면이 통째로 다시 마운트된다.
 */
const withScreenErrorBoundary = <P extends object>(
  Screen: ComponentType<P>,
  { withSafeAreaTop }: { withSafeAreaTop?: boolean } = {},
) => {
  const Wrapped = (props: P) => (
    <ScreenErrorBoundary withSafeAreaTop={withSafeAreaTop}>
      <Screen {...props} />
    </ScreenErrorBoundary>
  );
  Wrapped.displayName = `withScreenErrorBoundary(${Screen.displayName ?? Screen.name ?? 'Screen'})`;
  return Wrapped;
};

export { ScreenErrorBoundary, withScreenErrorBoundary };
```

- [ ] **Step 4: 통과 확인** — `npx jest src/components/common/ScreenErrorBoundary` PASS.
- [ ] **Step 5: prettier·eslint·tsc (커밋하지 않음)**

---

### Task 5: App.tsx — 스낵바 생략, 루트 대체 화면, 로그인 바운더리

**Files:**
- Modify: `App.tsx` (`subscribeListener`, `AppContent`의 `<Login />`, `App()`)

**Interfaces:**
- Consumes: `isThrownToBoundary` (Task 1), `ErrorFallback` (Task 3), `ScreenErrorBoundary` (Task 4)

- [ ] **Step 1: 스낵바 생략** — `subscribeListener`에서 `captureApiError(...)` 다음, 콘솔 로깅 블록 앞에 추가:

```ts
    /*
     * 화면 에러 바운더리로 던져진 조회(핵심 데이터 첫 로딩 실패)는 에러 화면이 안내하므로 공통 스낵바를 띄우지 않는다.
     * Sentry 수집은 위에서 이미 끝났다.
     */
    if (isThrownToBoundary(event)) {
      return;
    }
```

import: `import { isThrownToBoundary } from 'utils/error';`

- [ ] **Step 2: 로그인 바운더리** — `AppContent`의 `<Login />`을 다음으로 교체:

```tsx
        /* 로그인은 네비게이터 밖에서 직접 그려 화면 HOC가 닿지 않는다 */
        <ScreenErrorBoundary withSafeAreaTop>
          <Login />
        </ScreenErrorBoundary>
```

- [ ] **Step 3: 루트 대체 화면** — 파일 모듈 레벨(`App` 위)에:

```tsx
/*
 * 화면 바운더리 바깥(Provider·네비게이터 헤더·탭바·루트 다이얼로그)의 렌더 에러용 전체 화면.
 * 없으면 React가 앱 트리 전체를 내려 릴리즈에서 하얀 화면이 된다. 수집은 Sentry.ErrorBoundary가 한다.
 * Sentry.wrap(v7)은 대체 화면 옵션이 없어 바운더리를 직접 둔다.
 */
const renderRootErrorFallback = ({ resetError }: { resetError: () => void }) => (
  <ErrorFallback variant="DEFAULT" onRetry={resetError} withSafeAreaTop />
);
```

`App()`의 `GestureHandlerRootView` 안쪽에서 `QueryClientProvider ... </QueryClientProvider>`를 감싼다:

```tsx
    <GestureHandlerRootView style={styles.container}>
      <Sentry.ErrorBoundary fallback={renderRootErrorFallback}>
        <QueryClientProvider client={queryClient}>
          {/* 기존 내용 그대로 */}
        </QueryClientProvider>
      </Sentry.ErrorBoundary>
      {ENABLE_DEVTOOLS && (/* 기존 그대로 */)}
    </GestureHandlerRootView>
```

import: `ErrorFallback`, `ScreenErrorBoundary`. `export default Sentry.wrap(App);`은 유지.

- [ ] **Step 4: 검증** — `npx tsc --noEmit -p .`, `npx jest` 전체 PASS, prettier·eslint. (App.tsx 판단 로직은 Task 1 `isThrownToBoundary` 테스트가 담당)
- [ ] **Step 5: 커밋하지 않음**

---

### Task 6: 바텀시트 내용 바운더리

**Files:**
- Create: `src/components/common/BottomSheet/SheetContentBoundary.tsx`
- Modify: `src/components/common/BottomSheet/index.tsx` (children 렌더부)
- Test: `src/components/common/BottomSheet/__tests__/SheetContentBoundary.test.tsx`

**Interfaces:**
- Consumes: `captureRenderError` (Task 2)
- Produces: `SheetContentBoundary({ onError, children })` — 에러 시 `null` 렌더 + `onError()` 1회

- [ ] **Step 1: 실패하는 테스트 작성**

```tsx
/* 시트 내용 바운더리: 에러 시 내용 대신 아무것도 그리지 않고, 닫기 콜백·수집을 1회 부른다 */
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import renderer from 'react-test-renderer';
import { Text } from 'react-native';

const mockCaptureRenderError = jest.fn();
jest.mock('utils/sentry', () => ({
  captureRenderError: (...args: unknown[]) => mockCaptureRenderError(...args),
}));

import { SheetContentBoundary } from 'components/common/BottomSheet/SheetContentBoundary';

const Broken = () => {
  throw new TypeError('sheet render');
};

describe('SheetContentBoundary', () => {
  let consoleSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    mockCaptureRenderError.mockClear();
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => consoleSpy.mockRestore());

  it('정상일 때는 자식을 그린다', () => {
    const tree = renderer.create(
      <SheetContentBoundary onError={jest.fn()}>
        <Text>ok</Text>
      </SheetContentBoundary>,
    );
    expect(tree.root.findByType(Text).props.children).toBe('ok');
  });

  it('렌더 에러면 아무것도 그리지 않고 onError와 수집을 부른다', () => {
    const onError = jest.fn();
    const tree = renderer.create(
      <SheetContentBoundary onError={onError}>
        <Broken />
      </SheetContentBoundary>,
    );
    expect(tree.toJSON()).toBeNull();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(mockCaptureRenderError).toHaveBeenCalledWith(expect.any(TypeError), 'bottom-sheet');
  });
});
```

- [ ] **Step 2: 실패 확인** — `npx jest src/components/common/BottomSheet` FAIL.
- [ ] **Step 3: 구현** — `SheetContentBoundary.tsx`

```tsx
import { Component, type ReactNode } from 'react';

import { captureRenderError } from 'utils/sentry';

interface Props {
  /* 시트를 닫고 사용자에게 알리는 처리. 바텀시트 래퍼가 넘긴다 */
  onError: () => void;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/*
 * 바텀시트 내용의 렌더 에러를 받는 바운더리.
 * gorhom 시트는 루트 portal에 그려져 화면 바운더리 밖이라 따로 둔다. 시트 안에 에러 UI를 두지 않고 닫는다 —
 * 내용이 대부분 입력 폼이라 같은 상태로 다시 그려도 또 깨질 가능성이 크다.
 * 시트가 닫히면 내용이 언마운트되므로 다음에 열 때 상태가 초기화된다.
 */
class SheetContentBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    captureRenderError(error, 'bottom-sheet');
    this.props.onError();
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

export { SheetContentBoundary };
```

`BottomSheet/index.tsx`: 컴포넌트 안에 콜백 추가

```tsx
  /* 시트 내용이 렌더 에러로 깨지면 시트를 닫고 알린다(수집은 SheetContentBoundary가 한다) */
  const handleContentError = useCallback(() => {
    innerRef.current?.dismiss();
    showSnackbar('앗 잠시 문제가 생겼어요. 다시 시도해 주세요.', { type: SNACKBAR_TYPE.ERROR });
  }, []);
```

children 렌더부의 `{children}` 두 곳(ScrollView 안·밖)을 `<SheetContentBoundary onError={handleContentError}>{children}</SheetContentBoundary>`로 교체. import: `SheetContentBoundary`, `showSnackbar, SNACKBAR_TYPE` from `stores/snackbarStore`.

- [ ] **Step 4: 통과 확인** — 테스트 PASS, `npx jest` 전체 PASS.
- [ ] **Step 5: prettier·eslint·tsc (커밋하지 않음)**

---

### Task 7: 모든 화면을 바운더리로 감싸기

**Files (Modify):**
- `src/components/navigators/Tab/Home/index.tsx` — Feed, Home(`withSafeAreaTop`), Mypage
- `src/components/navigators/Tab/Feedback/index.tsx` — ReceiveFeedback, SendFeedback
- `src/components/navigators/Stack/Home/index.tsx` — RealtimeNag, Myinfo, NotificationScreen, ReceivedFeedback, CheerCollection (HOME·SETTING·TASK_FORM·FEEDBACK은 네비게이터라 제외 — `TaskForm` import가 네비게이터인지 화면인지 확인하고, 화면이면 `withSafeAreaTop` 여부를 헤더 노출로 판단해 감싼다)
- `src/components/navigators/Stack/Mypage/index.tsx` — Setting, Myinfo, Notification, NoticeList, NoticeDetail, Policy, Account, BadgeInfo
- `src/components/navigators/Stack/Task/index.tsx` — Form, RoutineForm
- `src/components/navigators/Stack/Signup/index.tsx` — UserInfo, ServiceAgree
- `src/screens/Notification/index.tsx` — NotificationTab, EventTab

**Interfaces:**
- Consumes: `withScreenErrorBoundary` (Task 4)

- [ ] **Step 1: 감싸기** — 각 파일 import 아래 모듈 레벨에 상수를 만들고 `component`에 넘긴다. 예(Tab/Home):

```tsx
/* 화면 렌더 에러·핵심 데이터 첫 로딩 실패 시 내용 자리를 에러 화면으로 바꾼다(헤더·탭바는 유지) */
const FeedScreen = withScreenErrorBoundary(Feed);
/* 홈은 헤더를 화면 안에서 그려(headerShown: false) 에러 화면이 맨 위부터 덮는다 */
const HomeScreen = withScreenErrorBoundary(Home, { withSafeAreaTop: true });
const MypageScreen = withScreenErrorBoundary(Mypage);
```

`component={Feed}` → `component={FeedScreen}` 등. **렌더 함수 안에서 호출 금지**(네비게이터 컴포넌트 본문이 아니라 파일 최상단). `headerShown: false`인 leaf 화면은 `withSafeAreaTop: true`.

- [ ] **Step 2: 누락 점검** — `grep -rn "component={" src/components/navigators src/screens/Notification/index.tsx`로 모든 leaf 화면이 `...Screen` 상수(또는 네비게이터)인지 확인.
- [ ] **Step 3: tsc·jest·prettier·eslint (커밋하지 않음)**

---

### Task 8: 조회 훅 옵션 + 화면별 핵심 데이터 연결

**Files (Modify) — 훅:**
`useFetchTaskList`, `useFetchFeedbackAvailableDowithTasksInfinite`, `useFetchSuccessDowithTasks`, `useFetchMyDowithInfo`, `useFetchReceivedFeedbacks`, `useFetchSendFeedbacks`, `useFetchDowithTaskFeedbackAggregates`, `useFetchDowithTaskLikers`, `useFetchNotifications`, `useFetchNotices`, `useFetchNoticeDetail` (`useFetchDowithTask`·`useFetchTodoTask`는 이미 options를 받으므로 수정 없음)

**Files (Modify) — 호출부:** 아래 표

**Interfaces:**
- Consumes: `BoundaryQueryOptions`, `toThrowOnError`, `throwOnInitialError` (Task 1)

- [ ] **Step 1: 훅에 옵션 추가** — 기존 인자 뒤에 `{ throwOnError }: BoundaryQueryOptions = {}`를 추가하고 쿼리 옵션에 `throwOnError: toThrowOnError(throwOnError)`. 예:

```ts
const useFetchTaskList = ({ year, month }: fetchTaskListRequestSchemeType, { throwOnError }: BoundaryQueryOptions = {}) =>
  useQuery<fetchTaskListResponseSchemeType, ApiError, fetchTaskListResponseSchemeDataType>({
    queryKey: [...TASK_QUERY_KEY.LIST, year, month],
    queryFn: () => fetchTaskList({ year, month }),
    select: data => data.data,
    throwOnError: toThrowOnError(throwOnError),
  });
```

인자 없는 훅은 `(options: BoundaryQueryOptions = {})`, `enabled` 위치 인자가 있는 훅은 그 뒤(세 번째)에 둔다. 기본값은 꺼짐 — 기존 호출부 동작 불변.

- [ ] **Step 2: 핵심 화면에서 켜기**

| 호출부 | 변경 |
|---|---|
| `screens/Home` | `useFetchTaskList(prevMonth/currentMonth/nextMonth, { throwOnError: true })` 3곳 |
| `screens/Feed` | `useFetchFeedbackAvailableDowithTasksInfinite({ throwOnError: true })` |
| `components/Feed/FeedNagEmpty` | `useFetchSuccessDowithTasks(undefined, { throwOnError: true })` (빈 상태에서만 렌더되므로 "빈 상태일 때만 핵심") |
| `screens/Feed/RealtimeNag` | `useFetchFeedbackAvailableDowithTasksInfinite({ throwOnError: true })` |
| `screens/Mypage`, `screens/Mypage/Setting/Myinfo` | `useFetchMyDowithInfo({ throwOnError: true })` |
| `screens/Feedback/Receive` / `Send` | `useFetchReceivedFeedbacks({ throwOnError: true })` / `useFetchSendFeedbacks({ throwOnError: true })` |
| `screens/Feedback/ReceivedFeedback` | `useFetchDowithTask({ dowithTaskId }, { throwOnError: throwOnInitialError })`, `useFetchDowithTaskFeedbackAggregates(dowithTaskId, true, { throwOnError: true })` |
| `screens/Feedback/CheerCollection` | 위 두 개 + `useFetchDowithTaskLikers(dowithTaskId, true, { throwOnError: true })` |
| `screens/Home/Task/Form`, `components/Task/Form/Routine` | 기존 options 객체에 `throwOnError: throwOnInitialError` 추가 (`useFetchTodoTask`·`useFetchDowithTask`) |
| `screens/Notification` (`NotificationList`) | `useFetchNotifications(type, { throwOnError: true })` |
| `screens/Mypage/Setting/Notice/List` / `Detail` | `useFetchNotices(type, { throwOnError: true })` / `useFetchNoticeDetail(noticeId, { throwOnError: true })` |

부가 데이터(홈의 내 정보·받은 잡도리, 둘러보기의 `SuccessTaskImageList`, 알림 화면의 내 정보, 탭 헤더의 알림)는 바꾸지 않는다.

- [ ] **Step 3: 검증** — tsc·jest·prettier·eslint. `grep -rn "throwOnError" src`로 표와 일치하는지 확인.
- [ ] **Step 4: 커밋하지 않음**

---

### Task 9: 지침 문서 갱신 + 기기 확인 체크리스트

**Files (Modify):**
- `.claude/rules/state-management.md` — react-query 작성 규칙에 추가:
  `- 화면의 핵심 데이터(실패 시 0개·빈 목록·빈 상태로 보여 사실로 오해될 수 있는 데이터)를 조회할 때는 훅의 { throwOnError: true }(또는 options에 throwOnInitialError)를 켠다. 첫 로딩 실패만 화면 에러 바운더리로 가고, 다시 받기 실패·E302는 던지지 않는다. 부가 데이터는 켜지 않는다.`
- `.claude/rules/ui-components.md` — 전역 UI 패턴 표에 행 추가:
  `| 에러 화면 | components/common/ErrorFallback, ScreenErrorBoundary | 화면은 네비게이터 등록 시 withScreenErrorBoundary로 감싼다. 바텀시트는 공용 BottomSheet가 자동 처리 |`
- `.claude/rules/navigation.md` — "새 화면 추가 절차" 3번에: `component는 모듈 레벨에서 withScreenErrorBoundary(Screen)로 감싼 상수를 넘긴다(headerShown: false면 { withSafeAreaTop: true })`

- [ ] **Step 1: 문서 갱신** (위 문구 그대로)
- [ ] **Step 2: 전체 검증** — `npx tsc --noEmit -p .`, `npx jest`, `yarn lint`(기존 에러 5개 외 신규 없음)
- [ ] **Step 3: 기기 수동 확인 요청 목록 작성(보고용)**
  1. 비행기 모드로 앱 실행 후 각 탭 첫 진입 → "인터넷 연결" 화면(react-query 기본 재시도 3회 후 표시) → 연결 후 다시 시도 → 정상 화면.
  2. 데이터가 있는 상태에서 비행기 모드 + 당겨서 새로고침 → 화면 유지(스낵바만).
  3. 마이도리(네비게이터 헤더)·홈(화면 내 헤더) 에러 화면 가운데 정렬.
  4. 등록 시트 등 바텀시트 정상 동작(감싼 뒤 회귀 없음).
- [ ] **Step 4: 커밋하지 않음 — 완료 보고 후 사용자 지시 대기**
