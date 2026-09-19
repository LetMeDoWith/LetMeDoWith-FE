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

/* GA4 파라미터는 string/number만 안전 — boolean은 Android에서 유실될 수 있어 0|1로 보낸다 */
type AnalyticsEventMap = {
  sign_up_complete: { provider: string };
  home_view: undefined;
  dori_create_complete: { has_routine: 0 | 1; has_category: 0 | 1 };
  todo_create_complete: { has_routine: 0 | 1; has_category: 0 | 1; has_start_time: 0 | 1 };
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
  try {
    analytics()
      .logEvent(name, params)
      .catch(() => {});
  } catch {
    /* 동기 throw(이름 검증·네이티브 미준비)도 앱 흐름을 깨지 않게 */
  }
};

/*
 * 노출 이벤트 전용 헬퍼. 같은 화면 방문 안에서는 같은 도리를 중복 발송하지 않는다.
 * 둘러보기 화면이 blur될 때 resetDoriImpressions로 비운다.
 * 리셋 소유자는 둘러보기 하나다 — 다른 화면(실시간 잡도리 등)에 노출 측정을 켜려면
 * 화면별 Set으로 분리부터 해야 한다(공유 Set을 남의 blur가 비우게 된다).
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
