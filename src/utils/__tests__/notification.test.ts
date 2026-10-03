/*
 * 알림 레이어 초기화의 실패 경로 테스트.
 * FCM·notifee는 네이티브라 모킹하고, 초기화가 중간에 멈추거나 재시도가 막히지 않는지만 검증한다.
 * initNotificationLayer는 모듈 레벨 플래그(initialized/initializing)를 쓰므로 테스트마다 모듈을 새로 불러온다.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockRegisterDevice = jest.fn<() => Promise<void>>();
const mockGetToken = jest.fn<() => Promise<string>>();
const mockOnMessage = jest.fn(() => () => {});
const mockRequestPermission = jest.fn<() => Promise<{ authorizationStatus: number }>>();
const mockCaptureHandledError = jest.fn();

/* 팩토리는 import 시점에 실행되므로 화살표로 감싸 호출 시점에 모킹 함수를 읽게 한다(analytics.test 패턴) */
jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: () => ({
    registerDeviceForRemoteMessages: () => mockRegisterDevice(),
    getToken: () => mockGetToken(),
    onMessage: () => mockOnMessage(),
    onTokenRefresh: () => () => {},
    onNotificationOpenedApp: () => () => {},
    getInitialNotification: () => Promise.resolve(null),
  }),
}));

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    getNotificationSettings: () => Promise.resolve({ authorizationStatus: -1 }),
    requestPermission: () => mockRequestPermission(),
    createChannel: () => Promise.resolve('default'),
    onForegroundEvent: () => () => {},
  },
  AuthorizationStatus: { NOT_DETERMINED: -1, DENIED: 0, AUTHORIZED: 1, PROVISIONAL: 2 },
  AndroidImportance: { HIGH: 4 },
  EventType: { PRESS: 1 },
}));

jest.mock('@notifee/react-native/src/types/NotificationAndroid', () => ({ AndroidVisibility: { PUBLIC: 1 } }));

/* iOS 경로를 검증한다 — registerDeviceForRemoteMessages는 iOS에서만 호출된다 */
jest.mock('utils/device', () => ({ isAos: false }));

jest.mock('stores/index', () => ({
  useStore: {
    getState: () => ({
      notificationSettings: { marketing: false },
      notificationActions: { updateNotificationSettings: () => {} },
    }),
  },
}));

jest.mock('services/rest/member', () => ({ updateNotificationSettings: () => Promise.resolve() }));
jest.mock('utils/deepLink', () => ({ navigateByDeepLink: () => {} }));
jest.mock('utils/analytics', () => ({ logEvent: () => {} }));
jest.mock('utils/sentry', () => ({
  captureHandledError: (...args: unknown[]) => mockCaptureHandledError(...args),
}));

/* 모듈 레벨 플래그를 테스트마다 초기화하기 위해 매번 새로 불러온다 */
const loadInit = () => {
  let init!: typeof import('utils/notification').initNotificationLayer;
  jest.isolateModules(() => {
    init = require('utils/notification').initNotificationLayer;
  });
  return init;
};

describe('initNotificationLayer 실패 경로', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestPermission.mockResolvedValue({ authorizationStatus: 1 });
    mockRegisterDevice.mockResolvedValue(undefined);
    mockGetToken.mockResolvedValue('token');
  });

  it('iOS 원격 알림 등록이 실패해도 나머지 초기화(리스너 등록)를 진행하고 실패를 보고한다', async () => {
    mockRegisterDevice.mockRejectedValue(new Error('aps-environment 없음'));
    const initNotificationLayer = loadInit();

    await expect(initNotificationLayer()).resolves.toBeUndefined();

    expect(mockOnMessage).toHaveBeenCalledTimes(1);
    expect(mockCaptureHandledError).toHaveBeenCalledTimes(1);
  });

  it('초기화 도중 실패해도 진행 중 플래그가 풀려 다음 호출에서 다시 시도한다', async () => {
    mockRequestPermission.mockRejectedValueOnce(new Error('권한 요청 실패'));
    const initNotificationLayer = loadInit();

    await expect(initNotificationLayer()).resolves.toBeUndefined();
    await initNotificationLayer();

    expect(mockRequestPermission).toHaveBeenCalledTimes(2);
    expect(mockOnMessage).toHaveBeenCalledTimes(1);
  });
});
