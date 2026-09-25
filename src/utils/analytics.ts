import analytics from '@react-native-firebase/analytics';

import type { addTaskRequestSchemeType, taskCategorySchemeType } from 'types/task/scheme/api';

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

/*
 * 여부 플래그. GA4 파라미터는 string/number만 안전하다(boolean은 Android에서 유실될 수 있다).
 * 숫자 0/1은 맞춤 측정기준으로 등록하면 "0"/"1"로 보여 뜻이 불분명해, 리포트에서 바로 읽히는 문자열로 보낸다.
 */
type AnalyticsFlag = 'true' | 'false';

const toAnalyticsFlag = (value: boolean): AnalyticsFlag => (value ? 'true' : 'false');

type RoutineCycle = NonNullable<addTaskRequestSchemeType['routineCondition']>['cycle'];

/*
 * 매일 루틴은 서버 요청의 pattern이 빈 배열이다. 분석에서는 "모든 요일"로 펼쳐 보내 주간 루틴과 같은 기준으로 비교한다.
 * 요일 번호는 루틴 폼(WEEKLY_DAY_INFO)과 같은 월=1 … 일=7.
 */
const EVERY_DAY_PATTERN = '1,2,3,4,5,6,7';

/*
 * id처럼 정수인 값은 문자열로 보낸다. 안드로이드 SDK는 JS 숫자를 항상 double로 넘겨
 * 맞춤 측정기준에서 632.0처럼 소수점이 붙는다.
 */
const toAnalyticsId = (id: number) => String(id);

/*
 * 도리·투두 생성 공통 파라미터. GA4 파라미터는 객체·배열을 받지 못해 루틴·카테고리를 필드 단위로 펼친다.
 * 루틴·카테고리가 없으면 cycle/type만 'NONE'으로 보내고 나머지 필드는 생략한다(리포트에서 "(not set)").
 */
type TaskCreateParams = {
  routine_cycle: RoutineCycle | 'NONE';
  /* 요일·날짜 번호 배열을 '1,3,5'처럼 쉼표로 이은 값. 매일 루틴은 '1,2,3,4,5,6,7' */
  routine_pattern?: string;
  routine_exclude_holidays?: AnalyticsFlag;
  routine_start_date?: string;
  routine_end_date?: string;
  category_id?: string;
  category_name?: string;
  /* 카테고리 목록 캐시에 없어 조회하지 못하면 'UNKNOWN' */
  category_type: taskCategorySchemeType['creationType'] | 'NONE' | 'UNKNOWN';
  /* 'HH:mm', 없으면 'NONE' */
  start_time: string;
};

/*
 * 요청 페이로드에는 카테고리 id만 있어 이름·타입은 카테고리 목록 캐시에서 찾는다.
 * 호출부(mutation onSuccess)가 queryClient 캐시를 넘긴다.
 */
const buildTaskCreateParams = (
  payload: addTaskRequestSchemeType,
  categories: taskCategorySchemeType[] = [],
): TaskCreateParams => {
  const routine = payload.routineCondition;
  const category = categories.find(item => item.id === payload.taskCategoryId);

  const routineParams: Partial<TaskCreateParams> = routine?.cycle
    ? {
        routine_pattern: routine.cycle === 'DAILY' ? EVERY_DAY_PATTERN : routine.pattern.join(','),
        routine_exclude_holidays: toAnalyticsFlag(routine.isExcludeHolidays),
        routine_start_date: routine.startDate,
        routine_end_date: routine.endDate,
      }
    : {};

  /* 캐시에서 못 찾으면 name 키 자체를 넣지 않는다 — undefined 값을 네이티브로 넘기지 않기 위해 */
  const categoryParams: Partial<TaskCreateParams> =
    payload.taskCategoryId === null
      ? {}
      : {
          category_id: toAnalyticsId(payload.taskCategoryId),
          ...(category && { category_name: category.title }),
        };

  const getCategoryType = (): TaskCreateParams['category_type'] => {
    if (payload.taskCategoryId === null) {
      return 'NONE';
    }
    return category?.creationType ?? 'UNKNOWN';
  };

  return {
    routine_cycle: routine?.cycle ?? 'NONE',
    ...routineParams,
    ...categoryParams,
    category_type: getCategoryType(),
    /* 서버 형식은 'HH:mm:ss' — 분 단위면 충분하다 */
    start_time: payload.startTime ? payload.startTime.slice(0, 5) : 'NONE',
  };
};

type AnalyticsEventMap = {
  sign_up_complete: { provider: string };
  home_view: undefined;
  dori_create_complete: TaskCreateParams;
  todo_create_complete: TaskCreateParams;
  browse_view: undefined;
  dori_impression: { dori_id: string };
  feedback_complete: { template_id: string };
  certification_complete: { dori_id: string };
  push_open: { deep_link: string };
};

/* 이벤트 성격 분류(개발자도구 표시용) */
type AnalyticsEventType = '유입' | '조회' | '생성' | '상호작용';

/* 개발자도구 Analytics 탭의 색 구분용. 이벤트를 추가하면 여기 누락 시 컴파일 오류가 난다. */
const EVENT_TYPE: Record<keyof AnalyticsEventMap, AnalyticsEventType> = {
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

type AnalyticsListener = (entry: { name: string; params?: Record<string, unknown>; type: AnalyticsEventType }) => void;

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

  try {
    devToolsListener?.({ name, params, type: EVENT_TYPE[name] });
  } catch {
    /* 개발자도구 문제가 앱 흐름을 깨지 않게 */
  }

  /* Metro 개발 빌드는 개발자도구에만 기록하고 전송하지 않는다 */
  if (__DEV__) {
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
  logEvent('dori_impression', { dori_id: toAnalyticsId(doriId) });
};

const resetDoriImpressions = () => {
  seenDoriIds.clear();
};

export {
  logEvent,
  logDoriImpression,
  resetDoriImpressions,
  setAnalyticsListener,
  toAnalyticsFlag,
  toAnalyticsId,
  buildTaskCreateParams,
  EVENT_TYPE,
};
export type { AnalyticsEventType, AnalyticsFlag, AnalyticsListener, TaskCreateParams };
