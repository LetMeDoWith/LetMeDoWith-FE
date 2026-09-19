/*
 * 애널리틱스 코어 로직 테스트.
 * firebase 모듈은 네이티브라 모킹하고, 게이트·리스너·중복 제거만 검증한다.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockLogEvent = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
jest.mock('@react-native-firebase/analytics', () => ({
  __esModule: true,
  default: () => ({ logEvent: mockLogEvent }),
}));

import {
  logEvent,
  logDoriImpression,
  resetDoriImpressions,
  setAnalyticsListener,
  EVENT_CATEGORY,
} from 'utils/analytics';

describe('logEvent', () => {
  beforeEach(() => {
    mockLogEvent.mockClear();
    setAnalyticsListener(null);
    resetDoriImpressions();
  });

  /* jest 환경은 __DEV__=true — 전송하지 않고 리스너에만 알린다 */
  it('__DEV__에서는 firebase로 전송하지 않는다', () => {
    logEvent('home_view');
    expect(mockLogEvent).not.toHaveBeenCalled();
  });

  it('리스너에 이름·파라미터·카테고리·전송 여부를 알린다', () => {
    const listener = jest.fn();
    setAnalyticsListener(listener);
    logEvent('dori_create_complete', { has_routine: 1, has_category: 0 });
    expect(listener).toHaveBeenCalledWith({
      name: 'dori_create_complete',
      params: { has_routine: 1, has_category: 0 },
      category: '생성',
      sent: false,
    });
  });

  it('리스너가 던져도 이벤트 흐름이 깨지지 않는다', () => {
    setAnalyticsListener(() => {
      throw new Error('listener boom');
    });
    expect(() => logEvent('home_view')).not.toThrow();
  });
});

describe('EVENT_CATEGORY', () => {
  it('9개 이벤트가 모두 카테고리를 가진다', () => {
    expect(Object.keys(EVENT_CATEGORY).sort()).toEqual(
      [
        'sign_up_complete',
        'home_view',
        'dori_create_complete',
        'todo_create_complete',
        'browse_view',
        'dori_impression',
        'feedback_complete',
        'certification_complete',
        'push_open',
      ].sort(),
    );
  });
});

describe('logDoriImpression', () => {
  beforeEach(() => {
    setAnalyticsListener(null);
    resetDoriImpressions();
  });

  it('같은 화면 방문 안에서는 같은 id를 한 번만 보낸다', () => {
    const listener = jest.fn();
    setAnalyticsListener(listener);
    logDoriImpression(7);
    logDoriImpression(7);
    logDoriImpression(8);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('reset 후에는 같은 id를 다시 보낸다', () => {
    const listener = jest.fn();
    setAnalyticsListener(listener);
    logDoriImpression(7);
    resetDoriImpressions();
    logDoriImpression(7);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
