import * as Sentry from '@sentry/react-native';
import axios from 'axios';
import Config from 'react-native-config';

import { ErrorStatusCodeEnum } from 'schemes/shared/enum';
import { IS_DEV_MODE } from 'utils/env';
import type { BaseResponseSchemeType } from 'types/shared/scheme/api';

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
      /* 소셜 로그인 취소: 카카오 / 애플(1001) / 구글(12501) */
      /user cancelled/i,
      /com\.apple\.AuthenticationServices\.AuthorizationError error 1001/,
      /SIGN_IN_CANCELLED|12501/,
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
    Sentry.captureException(error);
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

export {
  initSentry,
  setSentryUser,
  clearSentryUser,
  captureApiError,
  normalizeEndpoint,
  navigationIntegration,
  TRACES_SAMPLE_RATE,
};
