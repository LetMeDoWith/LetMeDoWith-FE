/*
 * Sentry 코어 로직 테스트. 네이티브 SDK는 모킹하고 init 가드·user 매핑만 검증한다.
 * (jest 모킹 팩토리의 변수 호이스팅 제약 때문에 모킹 객체는 mock 접두사를 쓴다)
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockInit = jest.fn();
const mockSetUser = jest.fn();
const mockCaptureException = jest.fn();
const mockScope = { setLevel: jest.fn(), setTag: jest.fn(), setFingerprint: jest.fn() };

/*
 * 팩토리는 utils/sentry가 import되는 시점(모킹 변수 할당 전)에 실행되므로,
 * analytics.test와 같이 화살표로 감싸 호출 시점에 모킹 함수를 읽게 한다.
 */
jest.mock('@sentry/react-native', () => ({
  init: (...args: unknown[]) => mockInit(...args),
  setUser: (...args: unknown[]) => mockSetUser(...args),
  withScope: (cb: (scope: typeof mockScope) => void) => cb(mockScope),
  captureException: (...args: unknown[]) => mockCaptureException(...args),
  reactNavigationIntegration: () => ({ registerNavigationContainer: jest.fn() }),
}));

jest.mock('react-native-config', () => ({
  SENTRY_DSN: 'https://test@test.ingest.sentry.io/1',
  DEV_API_URL: 'api.test.com',
  ENABLE_DEVTOOLS: 'false',
}));

import { initSentry, setSentryUser, clearSentryUser, captureApiError, normalizeEndpoint } from 'utils/sentry';

describe('initSentry', () => {
  beforeEach(() => {
    mockInit.mockClear();
    mockSetUser.mockClear();
  });

  /* 모듈 레벨 싱글턴 가드라 테스트를 나누면 두 번째에서 init이 다시 불리지 않는다 — 한 테스트에서 함께 검증 */
  it('중복 호출해도 1회만, __DEV__에서는 enabled=false로 초기화된다', () => {
    initSentry();
    initSentry();
    expect(mockInit).toHaveBeenCalledTimes(1);
    expect(mockInit.mock.calls[0]?.[0]).toMatchObject({ enabled: false, sendDefaultPii: false });
  });
});

describe('Sentry user', () => {
  it('memberId를 user.id로 설정한다', () => {
    setSentryUser('42');
    expect(mockSetUser).toHaveBeenCalledWith({ id: '42' });
  });

  it('clear 시 null을 넘겨 해제한다', () => {
    clearSentryUser();
    expect(mockSetUser).toHaveBeenCalledWith(null);
  });
});

/* ApiError 형태의 최소 목(axios 전체 타입을 채우지 않기 위해 never 캐스팅) */
const makeApiError = (over: { status?: number; statusCode?: string; url?: string; method?: string }) =>
  ({
    isAxiosError: true,
    response:
      over.status === undefined
        ? undefined
        : { status: over.status, data: over.statusCode ? { statusCode: over.statusCode } : {} },
    config: { url: over.url ?? 'v1/task/123', method: over.method ?? 'post' },
  } as never);

describe('normalizeEndpoint', () => {
  it('숫자 세그먼트만 :id로 치환하고 쿼리스트링을 제거한다', () => {
    expect(normalizeEndpoint('v1/task/123/feedback/45?page=2')).toBe('v1/task/:id/feedback/:id');
    expect(normalizeEndpoint(undefined)).toBe('unknown');
  });
});

describe('captureApiError', () => {
  beforeEach(() => {
    mockCaptureException.mockClear();
    mockScope.setLevel.mockClear();
    mockScope.setFingerprint.mockClear();
  });

  it('응답이 없으면(네트워크) error 레벨, no-response fingerprint로 수집한다', () => {
    captureApiError(makeApiError({}), 'query');
    expect(mockScope.setLevel).toHaveBeenCalledWith('error');
    expect(mockScope.setFingerprint).toHaveBeenCalledWith(['POST', 'v1/task/:id', 'no-response']);
    expect(mockCaptureException).toHaveBeenCalledTimes(1);
  });

  it('5xx는 error, 4xx는 warning 레벨이다', () => {
    captureApiError(makeApiError({ status: 500 }), 'mutation');
    expect(mockScope.setLevel).toHaveBeenLastCalledWith('error');
    captureApiError(makeApiError({ status: 404 }), 'query');
    expect(mockScope.setLevel).toHaveBeenLastCalledWith('warning');
  });

  it('axios 에러가 아니면 fingerprint 없이 기본(스택) 그룹핑으로 수집한다', () => {
    captureApiError(new Error('응답 가공 중 터짐'), 'query');
    expect(mockCaptureException).toHaveBeenCalledTimes(1);
    expect(mockScope.setFingerprint).not.toHaveBeenCalled();
  });

  it('E302(토큰 만료)는 수집하지 않는다', () => {
    captureApiError(makeApiError({ status: 401, statusCode: 'E302' }), 'query');
    expect(mockCaptureException).not.toHaveBeenCalled();
  });
});
