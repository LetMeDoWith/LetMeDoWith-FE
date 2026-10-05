import { AxiosError, AxiosHeaders, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import * as Sentry from '@sentry/react-native';

import { useDevToolsStore } from 'components/__dev__/devToolsStore';

/*
 * 에러 화면 확인용 — 조회(GET) 요청을 강제로 실패시킨다.
 * - NETWORK: 응답 없는 에러(Network Error) → "인터넷 연결을 확인해주세요." 화면
 * - SERVER: 500 응답 에러 → "데이터를 불러오지 못했어요." 화면
 * 등록·수정(POST/PUT/PATCH/DELETE)은 그대로 둬서 앱 상태가 꼬이지 않게 한다.
 * 실제 요청은 보내지 않고 요청 단계에서 끊는다.
 */
let interceptorId: number | null = null;
let isSentryFilterAdded = false;

/* 강제 실패 표시. Sentry 이벤트 프로세서가 이 표시로 테스트 에러를 거른다 */
const FORCED_MARK = '__devtoolsForced__';

const markForced = (error: AxiosError) => Object.assign(error, { [FORCED_MARK]: true });

/*
 * 개발자도구가 일부러 낸 에러인지. 전역 구독의 captureApiError는 원래 에러를 cause로 감싸 보내므로 cause도 본다.
 */
const isDevToolsForcedError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const record = error as Record<string, unknown>;
  return record[FORCED_MARK] === true || isDevToolsForcedError(record.cause);
};

const rejectWithForcedFailure = (config: InternalAxiosRequestConfig) => {
  const mode = useDevToolsStore.getState().apiFailureMode;
  const isQuery = (config.method ?? 'get').toLowerCase() === 'get';

  if (mode === 'OFF' || !isQuery) {
    return config;
  }

  if (mode === 'NETWORK') {
    return Promise.reject(markForced(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config)));
  }

  const data = { statusCode: 'E500', message: '[DevTools] 강제 서버 에러' };
  return Promise.reject(
    markForced(
      new AxiosError('Request failed with status code 500', AxiosError.ERR_BAD_RESPONSE, config, undefined, {
        status: 500,
        statusText: 'Internal Server Error',
        data,
        headers: {},
        config: { ...config, headers: config.headers ?? new AxiosHeaders() },
      }),
    ),
  );
};

const installApiFailureInterceptor = (client: AxiosInstance) => {
  interceptorId = client.interceptors.request.use(rejectWithForcedFailure);

  /*
   * 강제로 낸 에러는 Sentry로 보내지 않는다(dev 배포 빌드에서 테스트할 때 이슈가 쌓이지 않게).
   * 전역 이벤트 프로세서는 제거할 수 없어 한 번만 등록한다.
   */
  if (!isSentryFilterAdded) {
    isSentryFilterAdded = true;
    Sentry.addEventProcessor((event, hint) => (isDevToolsForcedError(hint?.originalException) ? null : event));
  }
};

const uninstallApiFailureInterceptor = (client: AxiosInstance) => {
  if (interceptorId != null) {
    client.interceptors.request.eject(interceptorId);
    interceptorId = null;
  }
};

export { installApiFailureInterceptor, uninstallApiFailureInterceptor, isDevToolsForcedError };
