/*
 * 펼침 영역 노출 스크롤 계산 테스트
 *
 * 잔소리 이모지 바가 화면 아래로 가려질 때만, 가려진 만큼 스크롤해야 한다.
 * 항목 위치와 무관하게 정렬하면 이미 보이는 항목에서도 목록이 튄다.
 */

import { describe, it, expect } from '@jest/globals';

import { getRevealScrollOffset } from 'utils/scroll';

describe('getRevealScrollOffset', () => {
  it('가려진 만큼 더한 오프셋을 돌려준다', () => {
    /* 바 하단 800, 보이는 하단 700 → 100 넘침 + 여백 16 */
    const offset = getRevealScrollOffset({ elementBottomY: 800, visibleBottom: 700, currentOffset: 200 });

    expect(offset).toBe(316);
  });

  it('완전히 보이면 null을 돌려준다(스크롤하지 않음)', () => {
    const offset = getRevealScrollOffset({ elementBottomY: 500, visibleBottom: 700, currentOffset: 200 });

    expect(offset).toBeNull();
  });

  it('여백만큼만 모자라도 그만큼 스크롤한다', () => {
    /* 바 하단이 보이는 하단과 같으면 여백 16만큼 부족하다 */
    const offset = getRevealScrollOffset({ elementBottomY: 700, visibleBottom: 700, currentOffset: 0 });

    expect(offset).toBe(16);
  });

  it('여백 안에 여유가 있으면 스크롤하지 않는다', () => {
    const offset = getRevealScrollOffset({ elementBottomY: 684, visibleBottom: 700, currentOffset: 0 });

    expect(offset).toBeNull();
  });
});
