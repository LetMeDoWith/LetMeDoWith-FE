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
  toAnalyticsFlag,
  toAnalyticsId,
  buildTaskCreateParams,
  EVENT_TYPE,
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

  it('리스너에 이름·파라미터·이벤트 타입을 알린다', () => {
    const listener = jest.fn();
    setAnalyticsListener(listener);
    logEvent('dori_create_complete', { routine_cycle: 'NONE', category_type: 'NONE', start_time: '09:00' });
    expect(listener).toHaveBeenCalledWith({
      name: 'dori_create_complete',
      params: { routine_cycle: 'NONE', category_type: 'NONE', start_time: '09:00' },
      type: '생성',
    });
  });

  it('리스너가 던져도 이벤트 흐름이 깨지지 않는다', () => {
    setAnalyticsListener(() => {
      throw new Error('listener boom');
    });
    expect(() => logEvent('home_view')).not.toThrow();
  });
});

describe('EVENT_TYPE', () => {
  it('9개 이벤트가 모두 이벤트 타입을 가진다', () => {
    expect(Object.keys(EVENT_TYPE).sort()).toEqual(
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

describe('toAnalyticsFlag', () => {
  it('boolean을 리포트에서 읽히는 문자열로 바꾼다', () => {
    expect(toAnalyticsFlag(true)).toBe('true');
    expect(toAnalyticsFlag(false)).toBe('false');
  });
});

describe('buildTaskCreateParams', () => {
  const basePayload = {
    title: '운동',
    date: '2026-09-25',
    taskCategoryId: null,
    startTime: null,
    routineCondition: null,
  };

  it('루틴·카테고리·시작 시간이 없으면 NONE만 보내고 나머지는 생략한다', () => {
    expect(buildTaskCreateParams(basePayload)).toEqual({
      routine_cycle: 'NONE',
      category_type: 'NONE',
      start_time: 'NONE',
    });
  });

  it('루틴·카테고리·시작 시간을 필드 단위로 펼친다', () => {
    const params = buildTaskCreateParams(
      {
        ...basePayload,
        taskCategoryId: 12,
        startTime: '09:30:00',
        routineCondition: {
          startDate: '2026-09-25',
          endDate: '2026-10-25',
          cycle: 'WEEKLY',
          pattern: [1, 3, 5],
          isExcludeHolidays: true,
        },
      },
      [{ id: 12, title: '운동', creationType: 'COMMON', emoji: '🏃', categoryHolderId: '' }],
    );
    expect(params).toEqual({
      routine_cycle: 'WEEKLY',
      routine_pattern: '1,3,5',
      routine_exclude_holidays: 'true',
      routine_start_date: '2026-09-25',
      routine_end_date: '2026-10-25',
      category_id: '12',
      category_name: '운동',
      category_type: 'COMMON',
      start_time: '09:30',
    });
  });

  it('카테고리 캐시에 없으면 id만 보내고 타입은 UNKNOWN이다', () => {
    const params = buildTaskCreateParams({ ...basePayload, taskCategoryId: 99 });
    expect(params.category_id).toBe('99');
    expect(params.category_type).toBe('UNKNOWN');
    expect(params).not.toHaveProperty('category_name');
  });

  it('매일 루틴은 패턴을 모든 요일로 펼친다', () => {
    const params = buildTaskCreateParams({
      ...basePayload,
      routineCondition: {
        startDate: '2026-09-25',
        endDate: '2026-09-26',
        cycle: 'DAILY',
        pattern: [],
        isExcludeHolidays: false,
      },
    });
    expect(params.routine_pattern).toBe('1,2,3,4,5,6,7');
  });
});

describe('toAnalyticsId', () => {
  it('정수 id를 소수점 없는 문자열로 바꾼다', () => {
    expect(toAnalyticsId(632)).toBe('632');
  });
});
