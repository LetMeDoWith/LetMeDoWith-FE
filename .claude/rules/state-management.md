# 상태 관리 지침 (zustand + react-query)

원칙: **서버 데이터는 react-query, 클라이언트 상태는 zustand.** 서버 응답을 zustand에 복제해 저장하지 않는다(캐시 이중화 금지). 컴포넌트 로컬에서만 쓰는 상태는 `useState`로 충분하다 — 전역 스토어에 올리지 않는다.

## 상태 배치 결정 기준

| 상태 성격               | 위치                                  | 예시                           |
| ----------------------- | ------------------------------------- | ------------------------------ |
| 서버 데이터 (조회/변경) | react-query                           | 태스크 목록, 피드백, 회원 정보 |
| 앱 전역 + 영속 필요     | `stores/index.ts` 병합 persist 스토어 | 토큰, memberId, 알림 설정      |
| 앱 전역 + 휘발성 UI     | 독립 zustand 스토어                   | 스낵바, 로딩 오버레이          |
| 화면/컴포넌트 로컬      | `useState` / `useReducer`             | 입력값, 펼침 여부              |
| 폼                      | react-hook-form + zod                 | 태스크 작성 폼                 |

## zustand 작성 규칙

### 영속(persist) 스토어 — `stores/index.ts`

- 인증·알림처럼 앱 재시작 후에도 유지돼야 하는 도메인 상태는 **기존 병합 스토어에 slice로 추가**한다. 새 persist 스토어를 따로 만들지 않는다.
- slice는 `stores/<도메인>/slice.ts`에 `StateCreator<해당Slice, [], [], 해당Slice>` 타입으로 작성하고, `stores/index.ts`의 `MergedStoreState`에 병합한다.
- **영속할 필드는 반드시 `partialize`에 추가**한다 — 빠뜨리면 재시작 시 소실된다. 파생 플래그(`isLoggedIn` 등)는 영속하지 않고 `onRehydrateStorage`에서 재계산한다.
- 저장소는 `secureStorage`(encrypted-storage)다. 민감하지 않은 대용량 데이터를 여기에 넣지 않는다.
- 초기값은 `INITIAL_<도메인>_STORAGE_VALUE`로 export해 초기화(reset) 로직에서 재사용한다.

### 독립 UI 스토어 — `stores/<이름>Store.ts`

- 스낵바·오버레이처럼 영속이 필요 없는 전역 UI 상태는 `snackbarStore.ts` 패턴의 독립 스토어로 만든다.
- 컴포넌트 밖(훅·유틸·인터셉터)에서 호출할 동작은 `showSnackbar`, `runWithSuppressedOverlay`처럼 **`getState()` 기반 헬퍼 함수로 함께 export**한다. 컴포넌트 밖에서 훅을 호출하지 않는다.

### 공통 규칙

- actions는 `<도메인>Actions` 객체 하나로 묶는다(병합 스토어 기준). 독립 소형 스토어는 `show`/`hide`처럼 평면 메서드도 허용(기존 스타일 유지).
- `set`은 항상 새 객체를 만든다. 기존 상태 직접 변이 금지. 중첩 갱신은 `set({ tokenInfo: { ...get().tokenInfo, ...info } })` 패턴.
- **구독은 selector로만** 한다: `useStore(state => state.isLoggedIn)`. 렌더와 무관하게 읽기만 할 때는 `useStore.getState()`.
- 스토어에서 다른 스토어를 import해 순환 참조를 만들지 않는다.

## react-query 작성 규칙

- 훅은 `hooks/queries/<도메인>/`에 1파일 1훅. 네이밍: 조회 `useFetchX`(무한 스크롤은 `useFetchXInfinite`), 생성 `useAddX`, 수정 `useUpdateX`, 삭제/기타 동사형(`useLikeX`).
- **제네릭을 명시적으로 채운다**: `useMutation<응답타입, ApiError, 페이로드타입>`, `useQuery`/`useInfiniteQuery`도 기존 훅과 같은 수준으로 명시. 에러 타입은 항상 `services/apiClient`의 `ApiError`.
- 쿼리 키는 **`constants/queries`의 `<도메인>_QUERY_KEY` 상수만** 사용한다. 훅 안에서 문자열 배열을 직접 만들지 않는다. 파라미터가 붙는 키는 `[...TASK_QUERY_KEY.LIST, year, month]` 형태로 상수를 확장한다.
- mutation 후 invalidate는 **영향받는 쿼리 키만 정확히** 지정한다. 도메인 전체 invalidate 금지. 화면에 자체 로딩 표시가 있는 refetch는 `runWithSuppressedOverlay`로 감싼다.
- 무한 스크롤은 `useFetchFeedbackAvailableDowithTasksInfinite` 패턴을 따른다: `initialPageParam: 0`, `getNextPageParam`에서 `currentPage + 1 < totalPage` 검사, 소비 측은 `hasNextPage && !isFetchingNextPage` 가드.
- `QueryClient`는 `services/queryClient.ts`의 단일 인스턴스만 사용한다. 새로 만들지 않는다(테스트 제외).
- 컴포넌트에서 응답의 일부만 쓰면 `select` 옵션으로 잘라 리렌더를 줄인다(성능 지침 참조).

## 폼 상태 (react-hook-form)

- 폼 상태를 zustand·useState로 수동 관리하지 않는다. `useForm<폼타입>`을 사용하고, 폼 타입은 `schemes/`의 zod 스킴에서 파생시킨다(`taskFormScheme` → `taskFormSchemeType` 패턴). resolver는 사용하지 않는 것이 현재 컨벤션이다.
- 폼 값 구독은 `watch()` 전체 구독 대신 필요한 필드만 `watch('field')` 또는 `useWatch`로 구독한다.
