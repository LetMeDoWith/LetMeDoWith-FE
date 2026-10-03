/*
 * Sentry 코어 로직 테스트. 네이티브 SDK는 모킹하고 init 가드·user 매핑만 검증한다.
 * (jest 모킹 팩토리의 변수 호이스팅 제약 때문에 모킹 객체는 mock 접두사를 쓴다)
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockInit = jest.fn();
/* init 가드 때문에 뒤 테스트에서는 init이 다시 불리지 않는다 — 첫 호출의 옵션을 붙잡아 둔다 */
let mockCapturedInitOptions: {
  beforeBreadcrumb: (breadcrumb: { category?: string }) => unknown;
  tracePropagationTargets: string[];
};
const mockSetUser = jest.fn();
const mockSetTag = jest.fn();
const mockCaptureException = jest.fn();
const mockScope = { setLevel: jest.fn(), setTag: jest.fn(), setFingerprint: jest.fn() };

/*
 * 팩토리는 utils/sentry가 import되는 시점(모킹 변수 할당 전)에 실행되므로,
 * analytics.test와 같이 화살표로 감싸 호출 시점에 모킹 함수를 읽게 한다.
 */
jest.mock('@sentry/react-native', () => ({
  init: (...args: unknown[]) => {
    mockCapturedInitOptions = args[0] as typeof mockCapturedInitOptions;
    return mockInit(...args);
  },
  setUser: (...args: unknown[]) => mockSetUser(...args),
  setTag: (...args: unknown[]) => mockSetTag(...args),
  withScope: (cb: (scope: typeof mockScope) => void) => cb(mockScope),
  captureException: (...args: unknown[]) => mockCaptureException(...args),
  reactNavigationIntegration: () => ({ registerNavigationContainer: jest.fn() }),
}));

jest.mock('react-native-config', () => ({
  SENTRY_DSN: 'https://test@test.ingest.sentry.io/1',
  DEV_API_URL: 'api.test.com',
  ENABLE_DEVTOOLS: 'false',
}));

import {
  initSentry,
  setSentryUser,
  clearSentryUser,
  captureApiError,
  captureHandledError,
  normalizeEndpoint,
  setSentryScreen,
  getScreenPath,
} from 'utils/sentry';

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

describe('init 옵션(개인정보·추적 범위 회귀 방지)', () => {
  it('console breadcrumb는 걸러지고 다른 breadcrumb는 통과한다', () => {
    initSentry();
    expect(mockCapturedInitOptions.beforeBreadcrumb({ category: 'console' })).toBeNull();
    const httpBreadcrumb = { category: 'http' };
    expect(mockCapturedInitOptions.beforeBreadcrumb(httpBreadcrumb)).toBe(httpBreadcrumb);
  });

  it('분산 추적 헤더는 우리 API 호스트에만 붙는다', () => {
    initSentry();
    expect(mockCapturedInitOptions.tracePropagationTargets).toEqual(['api.test.com']);
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

describe('captureHandledError', () => {
  beforeEach(() => {
    mockCaptureException.mockClear();
  });

  it('잡아서 처리한 에러도 발생 위치 태그를 붙여 보고한다', () => {
    const error = new Error('aps-environment 없음');
    captureHandledError(error, 'notification.registerRemote');
    expect(mockCaptureException).toHaveBeenCalledWith(error, {
      tags: { 'handled.context': 'notification.registerRemote' },
    });
  });
});

describe('captureApiError 이슈 제목 규격화', () => {
  /* 이슈 제목은 "타입: 메시지"로 만들어진다 — 보낸 에러의 name·message를 검사한다 */
  const capturedError = () => mockCaptureException.mock.calls[0]?.[0] as Error & { cause?: unknown };

  beforeEach(() => {
    mockCaptureException.mockClear();
  });

  it.each([
    [
      { status: 404, statusCode: 'E501', method: 'get', url: 'v1/tasks/123' },
      'ApiNotFoundError',
      'GET v1/tasks/:id → 404 (E501)',
    ],
    [{ status: 400, statusCode: 'E210' }, 'ApiBadRequestError', 'POST v1/task/:id → 400 (E210)'],
    [{ status: 400, statusCode: 'E100' }, 'ApiBadRequestError', 'POST v1/task/:id → 400 (E100)'],
    [{ status: 401, statusCode: 'E307' }, 'ApiKickoutError', 'POST v1/task/:id → 401 (E307)'],
    [{ status: 401, statusCode: 'E301' }, 'ApiAuthError', 'POST v1/task/:id → 401 (E301)'],
    [{ status: 500, statusCode: 'E400' }, 'ApiServerError', 'POST v1/task/:id → 500 (E400)'],
    [{}, 'ApiNetworkError', 'POST v1/task/:id → no-response'],
    [{ status: 403 }, 'ApiClientError', 'POST v1/task/:id → 403'],
    [{ status: 502 }, 'ApiServerError', 'POST v1/task/:id → 502'],
  ])('%j → %s', (input, expectedName, expectedMessage) => {
    const original = makeApiError(input);
    captureApiError(original, 'query');
    expect(capturedError().name).toBe(expectedName);
    expect(capturedError().message).toBe(expectedMessage);
    /* 원래 AxiosError는 cause로 연결해 이슈 상세에서 함께 보이게 한다 */
    expect(capturedError().cause).toBe(original);
  });
});

describe('setSentryScreen', () => {
  it('현재 화면 이름을 screen 태그로 남긴다', () => {
    setSentryScreen('MYTODO');
    expect(mockSetTag).toHaveBeenCalledWith('screen', 'MYTODO');
  });
});

describe('getScreenPath', () => {
  it('중첩 내비게이터는 상위/하위 경로로 이어 같은 이름의 화면을 구분한다', () => {
    const settingState = {
      index: 1,
      routes: [{ name: 'HOME' }, { name: 'SETTING', state: { index: 0, routes: [{ name: 'DEFAULT' }] } }],
    };
    expect(getScreenPath(settingState)).toBe('SETTING/DEFAULT');

    const tabState = {
      index: 0,
      routes: [{ name: 'HOME', state: { index: 1, routes: [{ name: 'MYTODO' }, { name: 'FEED' }] } }],
    };
    expect(getScreenPath(tabState)).toBe('HOME/FEED');
  });

  it('중첩이 없으면 화면 이름만, 상태가 없으면 undefined', () => {
    expect(getScreenPath({ index: 0, routes: [{ name: 'REALTIME_NAG' }] })).toBe('REALTIME_NAG');
    expect(getScreenPath(undefined)).toBeUndefined();
  });
});
