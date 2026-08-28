/*
 * 목록 응답 스킴 테스트
 *
 * 서버는 월별 태스크 목록에 isRoutine(루틴 설정 여부)을 내려준다.
 * 스킴에 이 필드가 없으면 타입에서 빠져 화면이 값을 쓰지 못하고,
 * 루틴 아이콘이 상세 조회 캐시가 있는 항목에만 뜨는 문제가 생긴다.
 */

import { describe, it, expect } from '@jest/globals';

import { dowithTaskScheme, todoTaskScheme } from 'schemes/task/api';

const baseTask = {
  id: 1,
  taskCategoryId: null,
  taskCategoryName: null,
  title: '테스트 태스크',
  status: 'WAIT',
  date: '2026-08-28',
  startTime: '13:00:00',
  isRoutine: true,
};

describe('태스크 목록 스킴', () => {
  it('투두 항목의 isRoutine을 보존한다', () => {
    const parsed = todoTaskScheme.parse(baseTask);

    expect(parsed.isRoutine).toBe(true);
  });

  it('두윗 항목의 isRoutine을 보존한다', () => {
    const parsed = dowithTaskScheme.parse({
      ...baseTask,
      isRoutine: false,
      successImageUrls: null,
      feedBackCount: 0,
    });

    expect(parsed.isRoutine).toBe(false);
  });

  it('isRoutine이 없으면 파싱에 실패한다', () => {
    const withoutIsRoutine = { ...baseTask, isRoutine: undefined };

    expect(() => todoTaskScheme.parse(withoutIsRoutine)).toThrow();
  });
});
