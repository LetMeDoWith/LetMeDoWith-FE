# 이벤트 태깅 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) 문법으로 진행을 추적한다.

**Goal:** Firebase Analytics 기반 이벤트 9종 태깅 + 개발자도구 Analytics 탭.

**Architecture:** `utils/analytics.ts`에 타입드 이벤트 맵·전송·리스너를 모으고(알림의 `utils/notification.ts` 관례), 호출부는 mutation `onSuccess`·화면 focus·알림 핸들러에 한 줄씩 얹는다. 개발자도구는 기존 인터셉터 방식으로 리스너만 등록한다.

**Tech Stack:** `@react-native-firebase/analytics`(신규), zustand, react-query v5, jest.

**Spec:** `docs/superpowers/specs/2026-09-19-analytics-event-tagging-design.md`

## Global Constraints

- **커밋 금지**: 이 프로젝트는 사용자의 명시적 지시 전 커밋하지 않는다(CLAUDE.md). 각 태스크의 "커밋" 단계는 수행하지 않고 변경을 워킹 트리에 남긴다. 전체 완료 후 사용자 지시로 성격별 커밋한다.
- 이벤트명·파라미터명은 스펙 표기 그대로(snake_case). 임의 변경 금지.
- 전송 게이트는 `__DEV__`만. `IS_DEV_MODE`를 쓰지 않는다(배포 빌드에서 이벤트가 전멸한다).
- import는 경로 별칭(`utils/*`, `components/*` …), named export, 여러 줄 주석은 `/* */`.
- 각 태스크 종료 시 `npx tsc --noEmit -p tsconfig.json`(오류 0), 마지막에 prettier + eslint.
- 개발용 UI는 `src/components/__dev__/`에만. 프로덕션 코드에 dev 분기를 흩뿌리지 않는다.

## 파일 구조

| 파일 | 역할 |
| --- | --- |
| `src/utils/analytics.ts` (신규) | 이벤트 맵·카테고리·logEvent·리스너·impression dedupe |
| `src/utils/__tests__/analytics.test.ts` (신규) | 코어 로직 테스트 |
| `src/components/__dev__/types.ts` | `AnalyticsEntry`, `DevToolsTab`에 `'Analytics'` |
| `src/components/__dev__/devToolsStore.ts` | `analyticsLogs` 상태·액션 |
| `src/components/__dev__/tabs/AnalyticsTab.tsx` (신규) | 탭 UI (카테고리 색 + 전송 배지) |
| `src/components/__dev__/DevToolsSheet.tsx` | TABS·렌더 분기 |
| `src/components/__dev__/DevToolsRoot.tsx` | 리스너 등록/해제 |
| `src/stores/auth/slice.ts` | `lastLoginProvider` (비영속) |
| 호출부 9곳 | Task 5~9 참조 |

---

### Task 1: 패키지 설치

**Files:**
- Modify: `package.json`, `ios/Podfile.lock`(pod install 산출)

**Interfaces:**
- Produces: `@react-native-firebase/analytics` 모듈 (이후 태스크가 import)

- [ ] **Step 1: 설치**

```bash
yarn add @react-native-firebase/analytics
cd ios && bundle exec pod install && cd ..
```

- [ ] **Step 2: 검증**

Run: `node -p "require('@react-native-firebase/analytics') && 'ok'"` → 에러 없이 로드.
`git diff ios/Podfile.lock | grep -i analytics` → `RNFBAnalytics` 항목 추가 확인.

- [ ] **Step 3: 커밋하지 않는다** (Global Constraints)

---

### Task 2: 코어 `utils/analytics.ts` (TDD)

**Files:**
- Create: `src/utils/analytics.ts`
- Test: `src/utils/__tests__/analytics.test.ts`

**Interfaces:**
- Produces:
  - `logEvent<E extends keyof AnalyticsEventMap>(name: E, ...params): void`
  - `logDoriImpression(doriId: number): void` / `resetDoriImpressions(): void`
  - `setAnalyticsListener(listener: AnalyticsListener | null): void`
  - `type AnalyticsListener = (entry: { name: string; params?: Record<string, unknown>; category: AnalyticsCategory; sent: boolean }) => void`
  - `type AnalyticsCategory = '유입' | '조회' | '생성' | '상호작용'`
  - `EVENT_CATEGORY: Record<keyof AnalyticsEventMap, AnalyticsCategory>`

- [ ] **Step 1: 실패하는 테스트 작성**

`src/utils/__tests__/analytics.test.ts`:

```ts
/*
 * 애널리틱스 코어 로직 테스트.
 * firebase 모듈은 네이티브라 모킹하고, 게이트·리스너·중복 제거만 검증한다.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockLogEvent = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
jest.mock('@react-native-firebase/analytics', () => ({
  __esModule: true,
  default: () => ({ logEvent: mockLogEvent }),
}));

import {
  logEvent,
  logDoriImpression,
  resetDoriImpressions,
  setAnalyticsListener,
  EVENT_CATEGORY,
} from 'utils/analytics';

describe('logEvent', () => {
  beforeEach(() => {
    mockLogEvent.mockClear();
    setAnalyticsListener(null);
    resetDoriImpressions();
  });

  /* jest 환경은 __DEV__=true — 전송하지 않고 리스너에만 알린다 */
  it('__DEV__에서는 firebase로 전송하지 않는다', () => {
    logEvent('home_view');
    expect(mockLogEvent).not.toHaveBeenCalled();
  });

  it('리스너에 이름·파라미터·카테고리·전송 여부를 알린다', () => {
    const listener = jest.fn();
    setAnalyticsListener(listener);
    logEvent('dori_create_complete', { has_routine: true, has_category: false });
    expect(listener).toHaveBeenCalledWith({
      name: 'dori_create_complete',
      params: { has_routine: true, has_category: false },
      category: '생성',
      sent: false,
    });
  });

  it('리스너가 던져도 이벤트 흐름이 깨지지 않는다', () => {
    setAnalyticsListener(() => {
      throw new Error('listener boom');
    });
    expect(() => logEvent('home_view')).not.toThrow();
  });
});

describe('EVENT_CATEGORY', () => {
  it('9개 이벤트가 모두 카테고리를 가진다', () => {
    expect(Object.keys(EVENT_CATEGORY).sort()).toEqual(
      [
        'sign_up_complete',
        'home_view',
        'dori_create_complete',
        'todo_create_complete',
        'browse_view',
        'dori_impression',
        'feedback_complete',
        'certification_complete',
        'push_open',
      ].sort(),
    );
  });
});

describe('logDoriImpression', () => {
  beforeEach(() => {
    setAnalyticsListener(null);
    resetDoriImpressions();
  });

  it('같은 화면 방문 안에서는 같은 id를 한 번만 보낸다', () => {
    const listener = jest.fn();
    setAnalyticsListener(listener);
    logDoriImpression(7);
    logDoriImpression(7);
    logDoriImpression(8);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('reset 후에는 같은 id를 다시 보낸다', () => {
    const listener = jest.fn();
    setAnalyticsListener(listener);
    logDoriImpression(7);
    resetDoriImpressions();
    logDoriImpression(7);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `yarn jest src/utils/__tests__/analytics.test.ts`
Expected: FAIL — `Cannot find module 'utils/analytics'`

- [ ] **Step 3: 구현**

`src/utils/analytics.ts`:

```ts
import analytics from '@react-native-firebase/analytics';

/*
 * 이벤트 태깅 코어. 이벤트 정의·전송·개발자도구 연결을 이 파일에 모은다
 * (알림을 utils/notification.ts에 모은 것과 같은 관례).
 *
 * 전송 게이트는 __DEV__만이다. IS_DEV_MODE를 쓰면 App Distribution 배포 빌드
 * (ENABLE_DEVTOOLS=true)에서 이벤트가 전혀 잡히지 않는다.
 *
 * TODO(prod 전환): 현재 이벤트는 dev Firebase 프로젝트로 간다. 어느 프로젝트로 갈지는
 * 코드가 아니라 빌드에 구워지는 설정 파일이 정하므로, prod 프로젝트가 생기면
 *   1. prod용 GoogleService-Info.plist(ios/)·google-services.json(android/app/) 발급
 *   2. prod 배포 파이프라인에 그 파일을 복원하는 CI 시크릿 추가
 *      (build-apps.yml의 dev 파일 복원 스텝과 동일한 방식)
 * 만 하면 된다. 이 파일의 이벤트 코드는 무변경이다.
 */

type AnalyticsEventMap = {
  sign_up_complete: { provider: string };
  home_view: undefined;
  dori_create_complete: { has_routine: boolean; has_category: boolean };
  todo_create_complete: { has_routine: boolean; has_category: boolean; has_start_time: boolean };
  browse_view: undefined;
  dori_impression: { dori_id: number };
  feedback_complete: { template_id: number };
  certification_complete: { dori_id: number };
  push_open: { deep_link: string };
};

type AnalyticsCategory = '유입' | '조회' | '생성' | '상호작용';

/* 개발자도구 Analytics 탭의 색 구분용. 이벤트를 추가하면 여기 누락 시 컴파일 오류가 난다. */
const EVENT_CATEGORY: Record<keyof AnalyticsEventMap, AnalyticsCategory> = {
  sign_up_complete: '유입',
  push_open: '유입',
  home_view: '조회',
  browse_view: '조회',
  dori_create_complete: '생성',
  todo_create_complete: '생성',
  dori_impression: '상호작용',
  feedback_complete: '상호작용',
  certification_complete: '상호작용',
};

type AnalyticsListener = (entry: {
  name: string;
  params?: Record<string, unknown>;
  category: AnalyticsCategory;
  sent: boolean;
}) => void;

/* 개발자도구가 등록하는 리스너. 프로덕션 코드에 dev 분기를 두지 않기 위한 연결 지점이다. */
let devToolsListener: AnalyticsListener | null = null;

const setAnalyticsListener = (listener: AnalyticsListener | null) => {
  devToolsListener = listener;
};

/* 파라미터 없는 이벤트는 두 번째 인자를 생략할 수 있게 오버로드형 시그니처를 쓴다 */
const logEvent = <E extends keyof AnalyticsEventMap>(
  name: E,
  ...args: AnalyticsEventMap[E] extends undefined ? [] : [params: AnalyticsEventMap[E]]
) => {
  const params = args[0];
  const sent = !__DEV__;

  try {
    devToolsListener?.({ name, params, category: EVENT_CATEGORY[name], sent });
  } catch {
    /* 개발자도구 문제가 앱 흐름을 깨지 않게 */
  }

  if (!sent) {
    return;
  }

  /* 분석 실패가 앱 흐름을 깨지 않게 — 실패는 조용히 버린다 */
  analytics()
    .logEvent(name, params)
    .catch(() => {});
};

/*
 * 노출 이벤트 전용 헬퍼. 같은 화면 방문 안에서는 같은 도리를 중복 발송하지 않는다.
 * 둘러보기 화면이 blur될 때 resetDoriImpressions로 비운다.
 */
const seenDoriIds = new Set<number>();

const logDoriImpression = (doriId: number) => {
  if (seenDoriIds.has(doriId)) {
    return;
  }
  seenDoriIds.add(doriId);
  logEvent('dori_impression', { dori_id: doriId });
};

const resetDoriImpressions = () => {
  seenDoriIds.clear();
};

export { logEvent, logDoriImpression, resetDoriImpressions, setAnalyticsListener, EVENT_CATEGORY };
export type { AnalyticsCategory, AnalyticsListener };
```

- [ ] **Step 4: 통과 확인**

Run: `yarn jest src/utils/__tests__/analytics.test.ts` → 전부 PASS.
Run: `npx tsc --noEmit -p tsconfig.json` → 오류 0.

---

### Task 3: 개발자도구 Analytics 탭

**Files:**
- Modify: `src/components/__dev__/types.ts`, `src/components/__dev__/devToolsStore.ts`, `src/components/__dev__/DevToolsSheet.tsx`, `src/components/__dev__/DevToolsRoot.tsx`
- Create: `src/components/__dev__/tabs/AnalyticsTab.tsx`

**Interfaces:**
- Consumes: Task 2의 `setAnalyticsListener`, `AnalyticsCategory`
- Produces: `AnalyticsEntry`, 스토어의 `analyticsLogs`/`pushAnalyticsLog`/`clearAnalyticsLogs`, `getNextAnalyticsId()`

- [ ] **Step 1: 타입 추가** — `types.ts`

```ts
export type DevToolsTab = 'Elements' | 'Console' | 'Network' | 'Storage' | 'Query' | 'Analytics';

export interface AnalyticsEntry {
  id: number;
  timestamp: number;
  name: string;
  params?: Record<string, unknown>;
  category: import('utils/analytics').AnalyticsCategory;
  /* __DEV__에서는 전송되지 않으므로 기록만인지 실제 전송인지 구분한다 */
  sent: boolean;
}
```

(기존 `DevToolsTab`에 `'Analytics'`만 덧붙이고, `AnalyticsEntry`는 파일 끝에 추가.)

- [ ] **Step 2: 스토어 확장** — `devToolsStore.ts` (기존 콘솔 패턴 그대로)

```ts
const MAX_ANALYTICS_ENTRIES = 200;

/* DevToolsState에 추가 */
analyticsLogs: AnalyticsEntry[];
pushAnalyticsLog: (entry: AnalyticsEntry) => void;
clearAnalyticsLogs: () => void;

/* id 카운터 (기존 _nextConsoleId 패턴) */
let _nextAnalyticsId = 0;
export const getNextAnalyticsId = () => ++_nextAnalyticsId;

/* create() 본문에 추가 */
analyticsLogs: [],
pushAnalyticsLog: entry =>
  set(state => ({
    analyticsLogs: [entry, ...state.analyticsLogs].slice(0, MAX_ANALYTICS_ENTRIES),
  })),
clearAnalyticsLogs: () => set({ analyticsLogs: [] }),
```

import에 `AnalyticsEntry` 추가.

- [ ] **Step 3: 탭 컴포넌트** — `tabs/AnalyticsTab.tsx` (ConsoleTab 구조 재사용)

```tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import dayjs from 'dayjs';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';

import { DevToolsButton } from 'components/__dev__/DevToolsButton';
import { useDevToolsStore } from 'components/__dev__/devToolsStore';
import type { AnalyticsEntry } from 'components/__dev__/types';
import type { AnalyticsCategory } from 'utils/analytics';

/* 카테고리별 색 — ConsoleTab의 LEVEL_COLORS 패턴 */
const CATEGORY_COLORS: Record<AnalyticsCategory, string> = {
  유입: '#E5C07B',
  조회: '#61DAFB',
  생성: '#98C379',
  상호작용: '#C678DD',
};

function AnalyticsItem({ item }: { item: AnalyticsEntry }) {
  const color = CATEGORY_COLORS[item.category];

  return (
    <View style={styles.row}>
      <Text style={styles.time}>{dayjs(item.timestamp).format('HH:mm:ss')}</Text>
      <View style={[styles.categoryBadge, { borderColor: color }]}>
        <Text style={[styles.categoryText, { color }]}>{item.category}</Text>
      </View>
      <View style={styles.body}>
        <Text style={[styles.name, { color }]}>{item.name}</Text>
        {item.params ? <Text style={styles.params}>{JSON.stringify(item.params)}</Text> : null}
      </View>
      <Text style={[styles.sentBadge, item.sent ? styles.sentYes : styles.sentNo]}>
        {item.sent ? '전송됨' : '기록만'}
      </Text>
    </View>
  );
}

const AnalyticsTab = () => {
  const analyticsLogs = useDevToolsStore(s => s.analyticsLogs);
  const clearAnalyticsLogs = useDevToolsStore(s => s.clearAnalyticsLogs);

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <DevToolsButton label="비우기" onPress={clearAnalyticsLogs} />
      </View>
      <BottomSheetFlatList
        data={analyticsLogs}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => <AnalyticsItem item={item} />}
        ListEmptyComponent={<Text style={styles.empty}>아직 기록된 이벤트가 없습니다</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  toolbar: { flexDirection: 'row', justifyContent: 'flex-end', padding: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 12, paddingVertical: 6 },
  time: { color: '#7F848E', fontSize: 11, fontVariant: ['tabular-nums'] },
  categoryBadge: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
  categoryText: { fontSize: 10 },
  body: { flex: 1 },
  name: { fontSize: 12, fontWeight: '600' },
  params: { color: '#ABB2BF', fontSize: 11, marginTop: 2 },
  sentBadge: { fontSize: 10, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1, overflow: 'hidden' },
  sentYes: { color: '#98C379', backgroundColor: 'rgba(152,195,121,0.15)' },
  sentNo: { color: '#7F848E', backgroundColor: 'rgba(127,132,142,0.15)' },
  empty: { color: '#7F848E', textAlign: 'center', marginTop: 24 },
});

export { AnalyticsTab };
```

주의: `DevToolsButton`의 실제 props 시그니처(`label`/`onPress`가 다르면 ConsoleTab의 사용 방식을 그대로 복사)에 맞춘다.

- [ ] **Step 4: 시트에 탭 등록** — `DevToolsSheet.tsx`

`TABS` 배열에 `'Analytics'` 추가, switch 분기에 `case 'Analytics': return <AnalyticsTab />;` + import 추가.

- [ ] **Step 5: 리스너 연결** — `DevToolsRoot.tsx` (기존 인터셉터 install/uninstall 패턴과 같은 위치)

```ts
import { setAnalyticsListener } from 'utils/analytics';
import { getNextAnalyticsId, useDevToolsStore } from 'components/__dev__/devToolsStore';

/* 기존 installConsoleInterceptor 호출부와 같은 useEffect 안에 추가 */
setAnalyticsListener(entry => {
  useDevToolsStore.getState().pushAnalyticsLog({
    id: getNextAnalyticsId(),
    timestamp: Date.now(),
    ...entry,
  });
});
/* cleanup에 추가 */
setAnalyticsListener(null);
```

- [ ] **Step 6: 검증**

Run: `npx tsc --noEmit -p tsconfig.json` → 오류 0.
수동: 시뮬레이터에서 개발자도구 열기 → Analytics 탭 노출 확인 (이벤트는 이후 태스크에서 발생).

---

### Task 4: 화면 조회 이벤트 (`home_view`, `browse_view`)

**Files:**
- Modify: `src/screens/Home/index.tsx`, `src/screens/Feed/index.tsx`

**Interfaces:**
- Consumes: `logEvent` (Task 2)

- [ ] **Step 1: 홈** — `src/screens/Home/index.tsx` 컴포넌트 본문에 추가

```tsx
import { useCallback } from 'react';            /* 기존 import에 병합 */
import { useFocusEffect } from '@react-navigation/native';
import { logEvent } from 'utils/analytics';

/* 탭 복귀도 방문으로 집계한다 — focus마다 발송 */
useFocusEffect(
  useCallback(() => {
    logEvent('home_view');
  }, []),
);
```

- [ ] **Step 2: 둘러보기** — `src/screens/Feed/index.tsx` 동일 패턴으로 `logEvent('browse_view')`.

- [ ] **Step 3: 검증**

`npx tsc --noEmit` → 0. 수동: 시뮬레이터에서 홈↔둘러보기 탭 전환 → Analytics 탭에 `home_view`/`browse_view`가 전환마다 쌓이는지, `기록만` 배지인지 확인.

---

### Task 5: 생성 이벤트 (`dori_create_complete`, `todo_create_complete`)

**Files:**
- Modify: `src/hooks/queries/task/useAddDowithTask.ts`, `src/hooks/queries/task/useAddTodoTask.ts`

**Interfaces:**
- Consumes: `logEvent`. mutation `onSuccess`의 두 번째 인자(variables)가 요청 페이로드다.

- [ ] **Step 1: 도리** — `useAddDowithTask.ts`의 `onSuccess: () => {`를 `onSuccess: (_, payload) => {`로 바꾸고 첫 줄에 추가

```ts
import { logEvent } from 'utils/analytics';
import { isNil } from 'utils/index';   /* 파일에 이미 없으면 추가 */

logEvent('dori_create_complete', {
  has_routine: !isNil(payload.routineCondition?.cycle),
  has_category: !isNil(payload.taskCategoryId),
});
```

(루틴 유무 판정은 `cycle` 존재 기준 — 등록 시트가 미설정 루틴을 `routineCondition: null`로 보내는 규칙과 일치한다.)

- [ ] **Step 2: 투두** — `useAddTodoTask.ts` 같은 방식 + `has_start_time: !isNil(payload.startTime)` 추가

```ts
logEvent('todo_create_complete', {
  has_routine: !isNil(payload.routineCondition?.cycle),
  has_category: !isNil(payload.taskCategoryId),
  has_start_time: !isNil(payload.startTime),
});
```

- [ ] **Step 3: 검증**

`npx tsc --noEmit` → 0. 수동: 등록 시트에서 도리/투두 각각 등록 → Analytics 탭에서 파라미터 값 확인(카테고리 없이 등록하면 `has_category: false` 등).

---

### Task 6: 가입 이벤트 (`sign_up_complete`) — provider 전달 포함

**Files:**
- Modify: `src/stores/auth/slice.ts`, `src/hooks/queries/auth/useFetchTokenQuery.ts`, `src/hooks/queries/member/useSignUp.ts`

**Interfaces:**
- Produces: `AuthSlice.lastLoginProvider: string | null`, `authActions.setLastLoginProvider(provider: string)`
- Consumes: `logEvent`

- [ ] **Step 1: auth slice 확장** — `src/stores/auth/slice.ts`

`AuthSlice` 인터페이스에 추가:

```ts
/* 마지막 소셜 로그인 제공자. 가입 완료 이벤트 파라미터용 — 세션 한정이라 영속하지 않는다. */
lastLoginProvider: string | null;
```

`authActions`에 `setLastLoginProvider: (provider: string) => void;` 추가.
`initialAuthState`에 `lastLoginProvider: null,` 추가.
`createAuthSlice`의 actions에 `setLastLoginProvider: provider => set({ lastLoginProvider: provider }),` 추가.
**`stores/index.ts`의 `partialize`에 넣지 않는다** (영속 금지 — 넣으면 규칙 위반).

- [ ] **Step 2: 로그인 성공 시 저장** — `useFetchTokenQuery.ts`

`onSuccess: ({ data }) => {`를 `onSuccess: ({ data }, { provider }) => {`로 바꾸고 첫 줄에:

```ts
useStore.getState().authActions.setLastLoginProvider(provider);
```

(요청 페이로드 `fetchTokenRequestSchemeType`에 `provider`가 이미 있다.)

- [ ] **Step 3: 가입 완료 시 발송** — `useSignUp.ts`의 `onSuccess` 마지막에

```ts
import { logEvent } from 'utils/analytics';

logEvent('sign_up_complete', {
  provider: useStore.getState().lastLoginProvider ?? 'UNKNOWN',
});
```

(`useStore`는 이 파일이 이미 import한다. 이론상 null일 수 없지만 파라미터 타입이 string이라 fallback을 둔다.)

- [ ] **Step 4: 검증**

`npx tsc --noEmit` → 0. `yarn jest` 전체 통과(스토어 스냅샷 테스트가 있으면 갱신). 수동 검증은 가입 플로우가 필요하므로 회원 탈퇴 후 재가입 시나리오는 사용자 확인에 맡기고, 코드 리뷰로 갈음.

---

### Task 7: 상호작용 이벤트 (`feedback_complete`, `certification_complete`)

**Files:**
- Modify: `src/hooks/queries/feedback/useSendFeedback.ts`, `src/hooks/queries/task/useFetchUploadTaskSuccessImageUrlList.ts`

**Interfaces:**
- Consumes: `logEvent`

- [ ] **Step 1: 잡도리 발송** — `useSendFeedback.ts`의 `onSuccess: () => {`를 `onSuccess: (_, { templateId }) => {`로 바꾸고 추가

```ts
import { logEvent } from 'utils/analytics';

logEvent('feedback_complete', { template_id: templateId });
```

- [ ] **Step 2: 시작 인증** — `useFetchUploadTaskSuccessImageUrlList.ts`의 `onSuccess`에 추가 (`id`는 훅 인자로 이미 클로저에 있다)

```ts
logEvent('certification_complete', { dori_id: id });
```

- [ ] **Step 3: 검증**

`npx tsc --noEmit` → 0. 수동: 둘러보기에서 잡도리 발송 → `feedback_complete`(template_id 포함) 확인. 인증은 실기기 카메라가 필요하므로 코드 리뷰 + 실기기 확인 항목으로 보고에 남긴다.

---

### Task 8: 푸시 진입 이벤트 (`push_open`)

**Files:**
- Modify: `src/utils/notification.ts`

**Interfaces:**
- Consumes: `logEvent`

- [ ] **Step 1: 태깅** — 클릭 핸들러 3곳(foreground PRESS·background·quit)이 모두 `handleDeepLinkFromData` 하나로 수렴하므로 **여기 한 곳만** 태깅한다:

```ts
import { logEvent } from 'utils/analytics';

const handleDeepLinkFromData = (data?: { [key: string]: unknown }) => {
  const deepLink = data?.deepLink;
  if (typeof deepLink === 'string') {
    /* 클릭 경로 3곳(포그라운드·백그라운드·종료 상태)이 모두 이 함수로 수렴한다 */
    logEvent('push_open', { deep_link: deepLink });
    navigateByDeepLink(deepLink);
  }
};
```

- [ ] **Step 2: 검증**

`npx tsc --noEmit` → 0. 알림 클릭은 실기기 확인이 필요하므로(시뮬레이터 원격 푸시 불가 — notifications.md) 보고에 실기기 확인 항목으로 남긴다.

---

### Task 9: 노출 이벤트 (`dori_impression`)

**Files:**
- Modify: `src/components/Feed/FeedNagItem/index.tsx`, `src/screens/Feed/index.tsx`

**Interfaces:**
- Consumes: `logDoriImpression`, `resetDoriImpressions` (Task 2)

설계 요지: 둘러보기 카드는 `FeedNagItem`(taskId prop 보유)이 그린다. v1은 **마운트 시 1회 발송**이고 중복 제거는 코어의 `Set`이 맡는다. 단, `FeedNagItem`은 실시간 잡도리(FlatList)에서도 재사용되므로 **둘러보기에서만 발송하도록 opt-in prop**을 둔다(스펙: 둘러보기 노출만 측정).

- [ ] **Step 1: 카드 태깅** — `FeedNagItem/index.tsx`

Props에 추가:

```ts
/* 둘러보기에서만 노출 이벤트를 보낸다(실시간 잡도리 재사용 시 미전달) — 스펙이 둘러보기 노출만 측정 대상으로 정의 */
shouldTrackImpression?: boolean;
```

컴포넌트 본문에 추가:

```ts
import { useEffect } from 'react';              /* 기존 import에 병합 */
import { logDoriImpression } from 'utils/analytics';

useEffect(() => {
  if (shouldTrackImpression) {
    logDoriImpression(taskId);
  }
  /* 같은 방문 내 중복은 코어의 Set이 걸러 의존성 변화에 안전하다 */
}, [shouldTrackImpression, taskId]);
```

- [ ] **Step 2: 둘러보기에서 opt-in + blur 초기화**

`FeedNagList`가 `FeedNagItem`을 그리는 지점에 `shouldTrackImpression` 전달(`FeedNagList`가 중간에 있으면 같은 이름의 prop으로 관통시킨다 — 목적 주석 포함).

`src/screens/Feed/index.tsx`의 Task 4에서 추가한 `useFocusEffect`에 cleanup 추가:

```ts
useFocusEffect(
  useCallback(() => {
    logEvent('browse_view');
    /* 화면을 떠나면 노출 기록을 비워, 다음 방문을 새 노출로 센다 */
    return () => resetDoriImpressions();
  }, []),
);
```

- [ ] **Step 3: 검증**

`npx tsc --noEmit` → 0. 수동: 둘러보기 진입 → 카드 수만큼 `dori_impression`(각기 다른 dori_id), 같은 화면에서 재렌더돼도 추가 발송 없음, 홈 갔다 돌아오면 다시 발송. **실시간 잡도리 화면에서는 발송되지 않는지**도 확인.

---

### Task 10: 마무리 검증

- [ ] **Step 1: 전체 검사**

```bash
npx tsc --noEmit -p tsconfig.json
yarn jest
npx prettier --write <이번에 만진 파일 전부>
npx eslint --quiet <이번에 만진 파일 전부>
```

전부 통과.

- [ ] **Step 2: 시뮬레이터 통합 확인** — 홈/둘러보기 전환, 도리·투두 등록, 잡도리 발송을 실제로 수행하며 Analytics 탭에서 카테고리 색 4종·`기록만` 배지·파라미터를 확인.

- [ ] **Step 3: 보고** — 커밋하지 않고 변경 목록·실기기 확인 필요 항목(가입, 인증, 푸시 클릭, dev 릴리즈 빌드의 `전송됨` 배지)을 사용자에게 보고.
