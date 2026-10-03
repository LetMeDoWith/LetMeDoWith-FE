/*
 * Sentry 코어 로직 테스트. 네이티브 SDK는 모킹하고 init 가드·user 매핑만 검증한다.
 * (jest 모킹 팩토리의 변수 호이스팅 제약 때문에 모킹 객체는 mock 접두사를 쓴다)
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockInit = jest.fn();
const mockSetUser = jest.fn();

/*
 * 팩토리는 utils/sentry가 import되는 시점(모킹 변수 할당 전)에 실행되므로,
 * analytics.test와 같이 화살표로 감싸 호출 시점에 모킹 함수를 읽게 한다.
 */
jest.mock('@sentry/react-native', () => ({
  init: (...args: unknown[]) => mockInit(...args),
  setUser: (...args: unknown[]) => mockSetUser(...args),
  withScope: jest.fn(),
  captureException: jest.fn(),
  reactNavigationIntegration: () => ({ registerNavigationContainer: jest.fn() }),
}));

jest.mock('react-native-config', () => ({
  SENTRY_DSN: 'https://test@test.ingest.sentry.io/1',
  DEV_API_URL: 'api.test.com',
  ENABLE_DEVTOOLS: 'false',
}));

import { initSentry, setSentryUser, clearSentryUser } from 'utils/sentry';

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
