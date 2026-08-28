/*
 * 달력 조회 범위·병합 유틸 테스트
 *
 * 달력은 보이는 달의 앞뒤 달 날짜까지 함께 그리므로(8월 그리드의 7월 말·9월 초),
 * 데이터도 3개월치를 받아 합쳐야 셀이 비지 않는다.
 */

import { describe, it, expect } from '@jest/globals';

import { buildCalendarMarkedDates, getSurroundingMonths, mergeTasksByDate } from 'utils/task';
import type { fetchTaskListResponseSchemeDataType } from 'types/task/scheme/api';

const makeTask = (id: number, date: string) => ({
  id,
  taskCategoryId: null,
  taskCategoryName: null,
  title: `태스크 ${id}`,
  status: 'WAIT' as const,
  date,
  startTime: '10:00:00',
  isRoutine: false,
});

const makeList = (todoDates: string[], dowithDates: string[] = []): fetchTaskListResponseSchemeDataType => ({
  todoTasks: todoDates.map((date, i) => makeTask(i + 1, date)),
  dowithTasks: dowithDates.map((date, i) => ({
    ...makeTask(100 + i, date),
    successImageUrls: null,
    feedBackCount: 0,
  })),
});

describe('getSurroundingMonths', () => {
  it('이전·현재·다음 달을 순서대로 돌려준다', () => {
    expect(getSurroundingMonths('2026-08-15')).toEqual([
      { year: 2026, month: 7 },
      { year: 2026, month: 8 },
      { year: 2026, month: 9 },
    ]);
  });

  it('1월이면 이전 달이 전년 12월이 된다', () => {
    expect(getSurroundingMonths('2026-01-10')).toEqual([
      { year: 2025, month: 12 },
      { year: 2026, month: 1 },
      { year: 2026, month: 2 },
    ]);
  });

  it('12월이면 다음 달이 이듬해 1월이 된다', () => {
    expect(getSurroundingMonths('2026-12-31')).toEqual([
      { year: 2026, month: 11 },
      { year: 2026, month: 12 },
      { year: 2027, month: 1 },
    ]);
  });
});

describe('buildCalendarMarkedDates', () => {
  it('선택 날짜에 selected를 넣는다', () => {
    const marks = buildCalendarMarkedDates({ selectedDate: '2026-08-31', visibleDate: '2026-09-10' });

    expect(marks['2026-08-31']).toEqual({ selected: true });
  });

  /*
   * CalendarList는 해당 달에 키가 하나도 없으면 그 페이지에 markedDates를 넘기지 않는다.
   * 보이는 달과 앞뒤 달에 빈 키를 넣어 항상 전달되게 한다.
   */
  it('보이는 달과 앞뒤 달의 1일에 빈 키를 넣는다', () => {
    const marks = buildCalendarMarkedDates({ selectedDate: '2026-08-31', visibleDate: '2026-09-10' });

    expect(marks['2026-08-01']).toEqual({});
    expect(marks['2026-09-01']).toEqual({});
    expect(marks['2026-10-01']).toEqual({});
  });

  it('선택 날짜가 1일이면 빈 키가 덮어쓰지 않는다', () => {
    const marks = buildCalendarMarkedDates({ selectedDate: '2026-09-01', visibleDate: '2026-09-10' });

    expect(marks['2026-09-01']).toEqual({ selected: true });
  });

  it('연말 경계에서도 앞뒤 달 키를 만든다', () => {
    const marks = buildCalendarMarkedDates({ selectedDate: '2026-12-25', visibleDate: '2026-12-25' });

    expect(marks['2026-11-01']).toEqual({});
    expect(marks['2027-01-01']).toEqual({});
  });
});

describe('mergeTasksByDate', () => {
  it('여러 달의 응답을 날짜별로 합친다', () => {
    const merged = mergeTasksByDate([makeList(['2026-07-31']), makeList(['2026-08-01'])]);

    expect(merged.get('2026-07-31')?.todoTasks).toHaveLength(1);
    expect(merged.get('2026-08-01')?.todoTasks).toHaveLength(1);
  });

  it('같은 날짜의 투두와 두윗을 한 항목으로 묶는다', () => {
    const merged = mergeTasksByDate([makeList(['2026-08-05'], ['2026-08-05'])]);

    expect(merged.get('2026-08-05')?.todoTasks).toHaveLength(1);
    expect(merged.get('2026-08-05')?.dowithTasks).toHaveLength(1);
  });

  it('아직 도착하지 않은(undefined) 응답은 건너뛴다', () => {
    const merged = mergeTasksByDate([undefined, makeList(['2026-08-05']), undefined]);

    expect(merged.get('2026-08-05')?.todoTasks).toHaveLength(1);
    expect(merged.size).toBe(1);
  });

  it('응답이 모두 없으면 빈 Map을 돌려준다', () => {
    expect(mergeTasksByDate([undefined, undefined, undefined]).size).toBe(0);
  });
});
