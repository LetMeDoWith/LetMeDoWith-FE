# 에러 바운더리 · 에러 화면 설계

- 작성일: 2026-10-05
- 상태: 설계 확정, 구현 계획 전

## 배경과 목표

- 지금 렌더 에러는 루트 `Sentry.wrap(App)`이 수집만 하고 화면은 깨진 채로 남는다(Sentry 연동 설계에서 "대체 화면은 후속"으로 미뤄 둠).
- API 에러는 React Query 전역 구독(App.tsx `subscribeListener`)이 Sentry 수집 + 공통 에러 스낵바로만 알리고, 화면 자체는 빈 채로 남는다. 받아 오지 못한 데이터가 "0개·빈 목록"처럼 보여 사용자가 사실로 오해할 수 있다.
- 목표: 화면이 보여줄 데이터를 처음부터 받지 못했거나 렌더가 깨졌을 때, 시안의 에러 화면으로 대체하고 "다시 시도하기"로 복구하게 한다.

## 확정된 결정

| 항목 | 결정 |
|---|---|
| 에러 화면을 띄우는 경우 | 렌더 에러 + 화면 **핵심 데이터를 처음 불러오다** 실패 |
| 적용 범위 | 모든 화면(로그인·회원가입·설정 포함). 조회가 없는 화면은 렌더 에러만 해당 |
| 배치 | 네비게이터 헤더·탭바를 제외한 콘텐츠 영역의 가로·세로 가운데 |
| 핵심 데이터 원칙 | 실패 시 "없음"과 "틀림"이 구분되지 않으면(0개·빈 목록·빈 상태로 보이면) 핵심 |
| 다시 받기 실패 | 데이터가 이미 있으면 화면 유지(지금처럼 스낵바 또는 자동 갱신은 조용히) |
| 구현 방식 | 화면 단위 바운더리 + 핵심 조회만 `throwOnError`로 바운더리에 던짐 |
| 바운더리 구현 | 직접 만든 클래스 컴포넌트 + `QueryErrorResetBoundary` (새 의존성 없음) |
| 바텀시트 | 공용 `BottomSheet` 내용에 바운더리 — 렌더 에러 시 시트를 닫고 스낵바 + Sentry 수집 |
| 화면 바깥 | `App` 최상단을 `Sentry.ErrorBoundary`로 감싸 대체 화면 연결 — 하얀 화면 대신 전체 화면 `DEFAULT` 에러 화면 |
| 토큰 만료(E302) | 데이터가 없어도 바운더리로 던지지 않음 — 재발급 후 재요청이 성공해도 에러 화면이 남는 것 방지 |

## 에러 화면 종류

| variant | 조건 | 일러스트 | 제목 | 설명 |
|---|---|---|---|---|
| `NETWORK` | 응답 없는 axios 에러(Network Error·timeout) | `error_network@3x.png` | 인터넷 연결을 확인해주세요. | 연결이 잠시 끊겼어요.<br>인터넷 연결을 확인하고 다시 시도해 주세요. |
| `DEFAULT` | 그 외 API 에러, 렌더 에러 | `error_data@3x.png` | 데이터를 불러오지 못했어요. | 불러오기에 실패했어요.<br>잠시 후 다시 시도해 주세요. |

- 버튼: "다시 시도하기" — 흰 배경, 회색 테두리, 둥근 모서리(시안).
- 일러스트: 디자이너가 준 516×300 투명 PNG(@3x 한 장, 시안 불투명도 반영). 화면 크기 172×100 고정.
  - `Frame 1739338927.png` → `assets/images/error_network@3x.png`
  - `Frame 1739338927 (1).png` → `assets/images/error_data@3x.png`

## 구성 요소

### 1. `components/common/ErrorFallback`
- props: `variant: 'NETWORK' | 'DEFAULT'`, `onRetry: () => void`.
- `flex: 1` + 가운데 정렬로 콘텐츠 영역의 정중앙에 배치. 텍스트·색은 theme 토큰만 사용.
- 화면 안에서 헤더를 직접 그리는 화면(`headerShown: false`, 예: 홈)은 그 헤더까지 에러 화면으로 대체된다. 이때 상단 안전 영역만큼 여백을 둬 가운데 정렬이 노치에 밀리지 않게 한다(`withSafeAreaTop` 옵션 또는 동등한 prop).

### 2. `components/common/ScreenErrorBoundary` + `withScreenErrorBoundary(Screen)`
- 클래스 컴포넌트. `getDerivedStateFromError`로 에러 보관, `componentDidCatch`에서 수집 판단(아래 4).
- `QueryErrorResetBoundary`로 감싸 `reset`을 받아, "다시 시도하기" 시 `reset()` + 바운더리 상태 초기화 → 자식 재마운트 → 실패했던 조회 재요청.
- `withScreenErrorBoundary`는 모든 네비게이터의 `component={...}` 등록부에서 감싼다. 화면 코드는 바꾸지 않는다.
  - 대상 네비게이터: `navigators/Stack/{Home,Mypage,Feedback,Task,Signup}`, `navigators/Tab/{Home,Feedback}`, `screens/Notification` 내부 탭.
- HOC 결과 컴포넌트는 모듈 레벨에서 한 번만 만든다(렌더 중 생성 시 매 렌더 재마운트).

### 3. `utils/error.ts` — `getErrorVariant(error): 'NETWORK' | 'DEFAULT'`
- `axios.isAxiosError(error) && !error.response` → `NETWORK`, 나머지 → `DEFAULT`.

### 4. `utils/sentry.ts` — `captureRenderError(error, context)` 추가
- 바운더리가 잡은 에러 중 **axios 에러가 아닌 것(렌더 에러)만** 보낸다. API 에러는 전역 구독이 이미 수집하므로 중복을 막는다.
- 태그: `boundary`(`screen` | `bottom-sheet`), 화면 경로는 기존 screen 태그로 자동 포함.
- Sentry 호출은 이 파일에만 둔다는 기존 규칙 유지.

### 5. `throwOnInitialError` — 핵심 조회 옵션
- `(_error, query) => query.state.data === undefined` 공용 함수.
- 같은 훅이 화면마다 핵심/부가가 다르므로(예: 내 정보 — 마이도리는 핵심, 홈은 부가) **훅이 `throwOnError` 옵션을 받고, 핵심으로 쓰는 화면에서만 켠다.** 훅 기본값은 끈 상태(현재 동작 유지).

### 6. 전역 구독 스낵바 생략
- App.tsx `subscribeListener`에서 "이 조회 에러가 바운더리로 던져지는가"를 판단하는 순수 함수(`isThrownToBoundary(event)`)를 분리.
  - 쿼리 이벤트 + `query.options.throwOnError`가 함수면 `(error, query)` 결과, boolean이면 그 값.
- true면 공통 스낵바를 건너뛴다. Sentry 수집(`captureApiError`)은 그대로.
- E302(토큰 만료) 처리 순서는 지금과 같다 — 재발급 흐름이 먼저 return한다.
  - 단, E302 조회도 데이터가 없으면 `throwOnInitialError`가 true라 바운더리로 던져진다. 재발급 후 재요청이 성공해도 에러 화면이 남는 문제를 막기 위해 `throwOnInitialError`에서 E302는 제외한다.

### 7. 공용 `BottomSheet` 내용 바운더리
- `components/common/BottomSheet`의 children을 감싸는 바운더리.
- 렌더 에러 시: 시트 `dismiss()` → `showSnackbar('앗 잠시 문제가 생겼어요. 다시 시도해 주세요.', { type: ERROR })` → `captureRenderError(error, 'bottom-sheet')`.
- 시트를 다시 열면 바운더리 상태가 초기화돼 정상 렌더를 다시 시도한다(닫힘 시 리셋).
- 이유: 시트 내용은 대부분 입력 폼이라 같은 상태로 재시도해도 다시 깨질 가능성이 크고, 시트 높이가 제각각이라 시트 안 에러 UI는 별도 디자인이 필요하다.

### 8. 앱 전체 대체 화면 (루트)
- 화면 바운더리 바깥(App.tsx Provider·초기화 컴포넌트, 네비게이터 헤더 버튼(`MypageHeaderRight` 등)·탭바, 루트 다이얼로그·스낵바·로딩 오버레이)의 렌더 에러는 지금 앱 트리 전체를 내려 릴리즈에서 하얀 화면이 된다.
- 설치된 `@sentry/react-native` v7의 `Sentry.wrap` 옵션(`ReactNativeWrapperOptions`)은 `profilerProps`·`touchEventBoundaryProps`만 받아 대체 화면을 줄 수 없다(`Sentry.wrap`은 바운더리가 아니다). 그래서 `App()`의 `GestureHandlerRootView` 바로 안을 `Sentry.ErrorBoundary`(`fallback={({ resetError }) => ...}`)로 감싼다. `Sentry.wrap`은 그대로 둔다.
- 전체 화면 `ErrorFallback`(DEFAULT, 상단 안전 영역 포함)을 띄우고, "다시 시도하기"는 `resetError`로 앱 트리를 다시 그린다.
- 이 바운더리는 Sentry 것이라 수집이 자동으로 한 번 된다(`captureRenderError` 불필요).
- 루트 대체 화면은 Provider 바깥에서 그려지므로 `ErrorFallback`은 Provider 컨텍스트에 의존하지 않는다(정적 `theme` 토큰만 사용, 상단 안전 영역은 `react-native-safe-area-context`의 `initialWindowMetrics`로 계산).
- 로그인 화면은 네비게이터 밖(`AppContent`에서 직접 렌더)이라 `App.tsx`에서 `ScreenErrorBoundary`로 직접 감싼다.

## 화면별 핵심 데이터

처음 불러오다 실패하면 에러 화면. 부가 데이터는 실패해도 화면 유지(지금 동작).

| 화면 | 핵심 데이터 | 부가 데이터 |
|---|---|---|
| 홈 | 할 일 3달치(앞·이번·다음) — 주 뷰가 달을 걸쳐 앞·뒤 달 실패 시 빈 목록·마킹 누락으로 보임 | 내 정보(헤더), 받은 잡도리(빨간 점) |
| 둘러보기 | 잡도리 가능 목록. **빈 상태(FeedNagEmpty)일 때는 인증 사진 목록도** | 목록이 있을 때의 인증 사진 목록 |
| 실시간 잡도리 | 잡도리 가능 목록 (빈 상태일 때 인증 사진 목록도) | |
| 마이도리 · 내 정보 설정 | 내 정보 | |
| 받은 잡도리 · 보낸 잡도리 | 각 목록 | |
| 받은 잡도리 상세 | 도리 상세 + 잡도리 집계 | |
| 응원 모아보기 | 도리 상세 + 잡도리 집계 + 좋아요 목록 (실패 시 0개로 보임) | |
| 할 일 수정 | 수정 대상 도리/투두 상세 | |
| 알림 | 알림 목록(각 탭) | 내 정보 |
| 알림 설정 | (조회 없음, mutation만) → 렌더 에러만 | |
| 공지 목록 · 상세 | 각 공지 | |
| 로그인 · 회원가입 · 설정 · 계정 · 뱃지 · 약관 | (조회 없음) → 렌더 에러만 | |

## 동작 흐름

1. 핵심 조회가 데이터 없이 실패 → `throwOnError` → 바운더리 → `ErrorFallback`(variant 판별). 공통 스낵바 생략, Sentry는 전역 구독이 수집.
2. "다시 시도하기" → `QueryErrorResetBoundary.reset()` + 바운더리 초기화 → 재마운트 → 실패 조회 재요청. 또 실패하면 다시 에러 화면.
3. 렌더 에러 → `DEFAULT` 에러 화면 + `captureRenderError`. "다시 시도하기"는 재렌더.
4. 데이터가 있는 상태의 다시 받기 실패, 부가 데이터 실패 → 지금과 동일.
5. 토큰 만료(E302) → 지금처럼 재발급 흐름. 바운더리로 던지지 않는다.
6. 바텀시트 렌더 에러 → 시트 닫기 + 스낵바 + Sentry.
7. 화면 바깥 렌더 에러 → 전체 화면 에러 화면 + Sentry(자동). "다시 시도하기"로 앱 트리 재렌더.

## 테스트

**jest (기존 react-test-renderer, 새 의존성 없음)**
- `getErrorVariant`: 응답 없는 axios 에러 → NETWORK, 응답 있는 axios 에러·일반 Error → DEFAULT.
- `throwOnInitialError`: 데이터 없음 → true, 있음 → false, E302 → false.
- `isThrownToBoundary`: throwOnError 함수/boolean/없음, 데이터 유무, mutation 이벤트.
- `ScreenErrorBoundary`: 자식 throw 시 fallback, 다시 시도 시 재렌더, 렌더 에러만 `captureRenderError` 호출(axios 에러는 미호출).
- 바텀시트 바운더리: 자식 throw 시 dismiss·스낵바·수집 호출.
- 루트 대체 화면: `ErrorFallback`이 Provider 없이 렌더되는지.

**기기 수동 확인**
- 비행기 모드로 각 탭 첫 진입 → 인터넷 연결 화면 → 연결 후 다시 시도 → 정상.
- 데이터가 있는 상태에서 비행기 모드로 자동 갱신·새로고침 → 화면 유지.
- 헤더 있는 화면(마이도리)·화면 내 헤더 화면(홈)의 가운데 정렬.
- 서버 5xx·렌더 에러는 jest로 검증.

## 범위 밖

- 루트 다이얼로그(`useDialog`) 내용의 렌더 에러만 따로 처리하는 것 — 루트 대체 화면이 받는다.
- mutation(등록·전송 등) 실패 — 지금처럼 스낵바.
- API timeout, QueryClient 기본 staleTime.
