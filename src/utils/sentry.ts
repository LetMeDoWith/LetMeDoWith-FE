import * as Sentry from '@sentry/react-native';
import axios from 'axios';
import Config from 'react-native-config';

import { ErrorStatusCodeEnum } from 'schemes/shared/enum';
import { IS_DEV_MODE } from 'utils/env';
import { SESSION_EXPIRED_STATUS_CODES } from 'constants/shared';
import type { BaseResponseSchemeType } from 'types/shared/scheme/api';

/*
 * 에러·성능 모니터링 코어. init·user·API 에러 캡처·내비게이션 연동을 이 파일에 모은다
 * (알림 utils/notification.ts, 애널리틱스 utils/analytics.ts와 같은 관례).
 *
 * 전송 게이트는 __DEV__만이다. Metro 개발 빌드는 보내지 않고, dev 배포 빌드(IS_DEV_MODE)는
 * environment='develop'으로, 추후 prod는 'production'으로 한 프로젝트 안에서 구분한다(백엔드 jobdori와 같은 값).
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
    environment: IS_DEV_MODE ? 'develop' : 'production',
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
      /*
       * 소셜 로그인 취소: 카카오 / 애플(1001) / 구글(12501).
       * 현재 로그인 버튼들이 에러를 catch해 여기까지 오지 않는다 — 그 catch가 사라져도
       * 취소가 이슈로 잡히지 않게 하는 방어선이다.
       */
      /user cancelled/i,
      /com\.apple\.AuthenticationServices\.AuthorizationError error 1001/,
      /SIGN_IN_CANCELLED|\b12501\b/,
    ],
    /*
     * 콘솔 breadcrumb는 끈다 — 기존 console.error가 서버 응답을 통째로 찍는 곳이 있어
     * 그대로 두면 에러 이벤트에 개인정보가 섞여 나간다.
     */
    beforeBreadcrumb: breadcrumb => (breadcrumb.category === 'console' ? null : breadcrumb),
  });
};

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
 * API 에러 종류. Sentry 이슈 제목은 "타입: 메시지"라 axios 에러를 그대로 보내면 전부
 * "AxiosError: Request failed with status code …"로 보인다 — 종류별 이름으로 규격화한다.
 * 기준은 서버 코드 그룹(백엔드 FailResponseStatus: E1XX·E2XX=400, E3XX=401·인증, E4XX=500, E5XX=404)이고,
 * 서버 코드가 없으면 HTTP 상태로 판단한다.
 */
type ApiErrorType =
  | 'ApiNetworkError'
  | 'ApiServerError'
  | 'ApiKickoutError'
  | 'ApiAuthError'
  | 'ApiBadRequestError'
  | 'ApiNotFoundError'
  | 'ApiClientError';

const SERVER_CODE_GROUP_TYPES: Record<string, ApiErrorType> = {
  E1: 'ApiBadRequestError',
  E2: 'ApiBadRequestError',
  E3: 'ApiAuthError',
  E4: 'ApiServerError',
  E5: 'ApiNotFoundError',
};

const classifyApiError = (status?: number, statusCode?: string): ApiErrorType => {
  if (status === undefined) {
    return 'ApiNetworkError';
  }
  /* 세션 만료 다이얼로그로 강제 로그아웃되는 코드(constants/shared, useRefreshTokenQuery와 공유) */
  if (statusCode && SESSION_EXPIRED_STATUS_CODES.includes(statusCode)) {
    return 'ApiKickoutError';
  }
  const groupType = statusCode ? SERVER_CODE_GROUP_TYPES[statusCode.slice(0, 2)] : undefined;
  if (groupType) {
    return groupType;
  }
  return status >= 500 ? 'ApiServerError' : 'ApiClientError';
};

/*
 * React Query 전역 에러 구독(App.tsx subscribeListener)에서 호출한다.
 * - 응답 없음(네트워크·타임아웃)·5xx: error / 4xx: warning
 * - E302(토큰 만료→재발급 경로)는 수집하지 않는다. App.tsx의 조기 return과 별개로
 *   여기서도 막아야 재발급 실패로 조기 return을 지나친 경우까지 걸러진다.
 * - 요청 헤더(Authorization)·본문은 보내지 않는다 — 태그·fingerprint만 구성한다.
 */
const captureApiError = (error: unknown, kind: 'query' | 'mutation') => {
  /*
   * queryFn·mutationFn이 던진 에러가 늘 axios 에러인 것은 아니다(응답 가공 중 TypeError 등).
   * 그런 에러에 API용 fingerprint를 붙이면 서로 다른 JS 버그가 이슈 하나로 뭉쳐 가려지므로,
   * 기본(스택) 그룹핑에 맡기고 호출 경로 태그만 남긴다.
   */
  if (!axios.isAxiosError<BaseResponseSchemeType>(error)) {
    Sentry.captureException(error, { tags: { 'api.kind': kind } });
    return;
  }

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

    /*
     * 제목을 "ApiNotFoundError: GET v1/tasks/:id → 404 (E501)"처럼 만든다.
     * 묶음 기준은 위 fingerprint라 이름·메시지를 바꿔도 이슈가 쪼개지지 않는다.
     * 원래 axios 에러는 cause로 연결해 이슈 상세의 연결된 에러로 함께 보이게 한다.
     */
    const statusCodeLabel = error.response?.data?.statusCode;
    const apiError = new Error(
      `${method} ${endpoint} → ${status ?? 'no-response'}${statusCodeLabel ? ` (${statusCodeLabel})` : ''}`,
    );
    apiError.name = classifyApiError(status, statusCodeLabel);
    Object.assign(apiError, { cause: error });
    Sentry.captureException(apiError);
  });
};

/*
 * 잡아서 복구한 에러를 보고한다. catch로 흐름을 이어가면 SDK의 자동 수집(미처리 예외·rejection)에
 * 잡히지 않으므로, 신호가 사라지지 않게 발생 위치(context) 태그를 붙여 직접 보낸다.
 */
const captureHandledError = (error: unknown, context: string) => {
  Sentry.captureException(error, { tags: { 'handled.context': context } });
};

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

/* react-navigation 상태 중 경로 계산에 필요한 부분만 — 중첩 내비게이터는 route.state로 이어진다 */
type NavigationStateLike = {
  index?: number;
  routes: { name: string; state?: NavigationStateLike }[];
};

/*
 * 포커스된 화면을 "상위/하위" 경로로 만든다(SETTING/DEFAULT, HOME/FEED).
 * 라우트 이름만 쓰면 DEFAULT·MYINFO처럼 여러 스택에 같은 이름이 있어 어느 화면인지 구분되지 않는다.
 */
const getScreenPath = (state?: NavigationStateLike) => {
  const names: string[] = [];
  let current = state;
  while (current) {
    const route: NavigationStateLike['routes'][number] | undefined = current.routes[current.index ?? 0];
    if (!route) {
      break;
    }
    names.push(route.name);
    current = route.state;
  }
  return names.length > 0 ? names.join('/') : undefined;
};

/*
 * 현재 화면 이름을 모든 이벤트의 screen 태그로 남긴다(App.tsx NavigationContainer onStateChange).
 * 화면을 에러 메시지 prefix로 붙이지 않는 이유: 같은 에러가 여러 화면에서 나면 이슈 제목엔
 * 첫 화면만 남아 오해를 부른다. 태그로 두면 이슈 상세에서 화면별 분포를 보고 필터할 수 있다.
 */
const setSentryScreen = (screenName?: string) => {
  if (screenName) {
    Sentry.setTag('screen', screenName);
  }
};

/* 로그인·복원 시 호출. 영향받은 사용자 수 집계용 — id 외의 개인정보는 넣지 않는다 */
const setSentryUser = (memberId: string) => {
  Sentry.setUser({ id: memberId });
};

/* 로그아웃·계정 초기화 시 호출 */
const clearSentryUser = () => {
  Sentry.setUser(null);
};

export {
  initSentry,
  setSentryUser,
  clearSentryUser,
  captureApiError,
  captureHandledError,
  captureRenderError,
  normalizeEndpoint,
  setSentryScreen,
  getScreenPath,
  navigationIntegration,
  TRACES_SAMPLE_RATE,
};
