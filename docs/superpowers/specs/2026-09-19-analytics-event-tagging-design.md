# 이벤트 태깅(애널리틱스) 설계

2026-09-19. Firebase Analytics 기반 이벤트 태깅 도입 설계.

## 목적

앱의 핵심 지표(가입·방문·핵심 기능 사용·상호작용·알림 효과)를 측정한다. 이벤트 9종은 기획에서 확정됐다.

## 결정 사항

| 항목 | 결정 | 근거 |
| --- | --- | --- |
| 백엔드 | Firebase Analytics (`@react-native-firebase/analytics`) | `@react-native-firebase/app`이 이미 설치돼 네이티브 설정 재사용. 푸시(FCM)와 같은 콘솔 |
| 파라미터 | 주요 맥락 포함 | 이벤트별 표 참조 |
| 전송 게이트 | `__DEV__`만 차단 | App Distribution 배포 빌드는 `ENABLE_DEVTOOLS=true`(= `IS_DEV_MODE`)라, `IS_DEV_MODE`로 막으면 테스터 데이터가 전혀 안 잡힌다 |
| Firebase 프로젝트 | 현재 dev 프로젝트 사용 | prod 프로젝트는 이후 생성. 전환은 설정 파일 교체만으로 끝나며 이벤트 코드는 무변경 (아래 "prod 전환" 절) |
| 검증 | 개발자도구 Analytics 탭 | DebugView는 쓰지 않는다 |

## 아키텍처

### 코어 — `utils/analytics.ts` (신규)

알림을 `utils/notification.ts`에 모은 것과 같은 관례로, 이벤트 정의·전송·개발자도구 연결을 한 파일에 모은다. mutation `onSuccess`·알림 핸들러처럼 컴포넌트 밖에서도 호출해야 하므로 훅이 아닌 유틸 함수다.

```ts
/* 이벤트명 → 파라미터 타입 맵. 오타·파라미터 누락을 컴파일에서 잡는다 */
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

/* 개발자도구 Analytics 탭용 카테고리. 이벤트를 추가하면 여기 누락 시 컴파일 오류 */
type AnalyticsCategory = '유입' | '조회' | '생성' | '상호작용';
const EVENT_CATEGORY: Record<keyof AnalyticsEventMap, AnalyticsCategory> = { ... };

const logEvent = <E extends keyof AnalyticsEventMap>(name: E, params?: AnalyticsEventMap[E]) => {
  notifyListener(name, params, /* sent: */ !__DEV__);   // 개발자도구 탭으로
  if (__DEV__) {
    return;                                             // Metro 개발 빌드는 전송하지 않는다
  }
  analytics().logEvent(name, params).catch(() => {});   // 분석 실패가 앱 흐름을 깨지 않게
};
```

- 제네릭으로 이벤트명 오타·파라미터 누락이 컴파일 오류가 된다.
- 개발자도구 연결은 리스너 등록 함수(`setAnalyticsListener`)만 export하고, 등록은 `__dev__` 쪽 초기화가 한다. 프로덕션 코드에 dev 분기를 흩뿌리지 않는 규칙(`dev-environment.md`)을 지킨다.

### prod 전환 (TODO로 코드에 남김)

이벤트가 어느 Firebase 프로젝트로 가는지는 코드가 아니라 네이티브 설정 파일이 정한다. `utils/analytics.ts` 상단에 아래 절차를 TODO 주석으로 문서화한다.

1. prod Firebase 프로젝트 생성 후 `GoogleService-Info.plist`·`google-services.json` 발급
2. prod 배포 파이프라인에서 그 파일을 복원하도록 CI 시크릿 추가 (현재 dev 파일 복원 스텝과 동일한 방식)
3. 이벤트 코드는 무변경 — dev(테스터)·prod(실사용자) 데이터가 프로젝트 단위로 분리된다

## 이벤트별 훅 지점과 파라미터

| 이벤트 | 훅 지점 | 파라미터 | 비고 |
| --- | --- | --- | --- |
| `sign_up_complete` | `useSignUp` onSuccess | `provider` (GOOGLE/KAKAO/APPLE) | 아래 "provider 전달" 참조 |
| `home_view` | 홈 화면 `useFocusEffect` | — | 탭 복귀도 방문으로 집계 |
| `dori_create_complete` | `useAddDowithTask` onSuccess | `has_routine`, `has_category` | 시작 시간은 도리 필수라 제외 |
| `todo_create_complete` | `useAddTodoTask` onSuccess | `has_routine`, `has_category`, `has_start_time` | |
| `browse_view` | 둘러보기 화면 `useFocusEffect` | — | |
| `dori_impression` | 아래 "노출 측정" 참조 | `dori_id` | |
| `feedback_complete` | `useSendFeedback` onSuccess | `template_id` | 페이로드에 이미 존재 |
| `certification_complete` | `useDowithCertification` 성공 처리 지점 | `dori_id` | |
| `push_open` | `utils/notification.ts` 클릭 핸들러 3곳 (foreground PRESS · background · quit) | `deep_link` | |

mutation 계열은 서버 성공이 확정된 `onSuccess`에서만 보낸다.

### provider 전달

provider는 로그인 버튼(`GoogleLoginButton` 등)에서만 쓰이고 저장되지 않아, 가입 완료 시점(`useSignUp.onSuccess`)에서는 접근할 수 없다. `stores/auth` slice에 **세션 한정** `lastLoginProvider`를 추가한다(로그인 버튼에서 set, `partialize`에 넣지 않아 영속하지 않음). 가입은 로그인 직후 같은 세션에서 일어나므로 충분하다.

### 노출 측정 (`dori_impression`) — v1 단순화

둘러보기는 ScrollView 기반이라 FlatList viewability API가 없다. v1은 **렌더된 카드가 마운트될 때 1회 발송**하고, 같은 화면 방문 안에서는 같은 `dori_id`를 중복 발송하지 않는다(모듈 레벨 `Set`, 화면 blur 시 초기화). "스크롤로 실제 뷰포트에 들어왔는지"까지 따지는 정밀 측정은 목적("어떤 도리가 보였는지") 대비 복잡도가 커서 보류하고, 필요해지면 그때 정밀화한다.

## 개발자도구 Analytics 탭

기존 구조(`DevToolsSheet`의 `TABS` + `tabs/` + `devToolsStore` + `interceptors/`)를 그대로 따른다.

- `TABS`에 `'Analytics'` 추가, `tabs/AnalyticsTab.tsx` 신설 — ConsoleTab 구조 재사용 (시각·이벤트명·파라미터 목록, 비우기 버튼)
- `devToolsStore`에 `analyticsLogs` / `addAnalyticsLog` / `clearAnalyticsLogs` 추가
- 초기화 시 `setAnalyticsListener`로 스토어에 연결 (기존 인터셉터 방식)
- **카테고리별 색 구분** — ConsoleTab의 `LEVEL_COLORS` 패턴:

| 카테고리 | 이벤트 | 색 |
| --- | --- | --- |
| 유입 | `sign_up_complete`, `push_open` | 노랑 |
| 조회 | `home_view`, `browse_view` | 파랑 |
| 생성 | `dori_create_complete`, `todo_create_complete` | 초록 |
| 상호작용 | `feedback_complete`, `certification_complete`, `dori_impression` | 보라 |

- **전송 여부 배지** — `__DEV__`에서는 전송되지 않으므로 각 로그에 "전송됨 / 기록만" 배지를 달아 혼동을 막는다.

## 검증 경로

| 상황 | 확인 방법 |
| --- | --- |
| `__DEV__` (Metro 개발) | Analytics 탭 (기록만, 전송 안 됨 배지) |
| dev 릴리즈 빌드 (테스터) | Analytics 탭 + dev Firebase GA4 집계 |

## 설치·주의

- `yarn add @react-native-firebase/analytics` 후 iOS는 `bundle exec pod install`까지가 한 세트 (네이티브 변경 → 재빌드 필요)
- Analytics는 앱 시작 시 자동 초기화되므로 별도 init 코드는 없다
- 테스트: `utils/analytics.ts`의 순수 로직(카테고리 매핑 완전성, `__DEV__` 게이트)은 jest로 검증하고, `@react-native-firebase/analytics`는 모킹한다

## 범위 밖 (명시)

- prod Firebase 프로젝트 생성·CI 시크릿 추가 — TODO 주석으로만 남김
- 노출 정밀 측정(뷰포트 기준) — v1 단순화, 필요 시 후속
- 화면 자동 추적(GA `screen_view`) — 표의 이벤트명 체계와 어긋나 도입하지 않음
