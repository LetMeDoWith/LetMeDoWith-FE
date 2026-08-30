/*
 * 코치마크 말풍선 배치·딤 조각 계산 테스트
 *
 * 대상 위치는 기기 크기와 태스크 제목 길이에 따라 달라지므로,
 * 화면을 벗어나지 않으면서 꼬리가 대상을 계속 가리키는지가 핵심이다.
 */

import { describe, it, expect } from '@jest/globals';

import { buildDimPath, getTooltipPlacement } from 'utils/onboarding';

const SCREEN = { screenWidth: 390, screenHeight: 844 };
const TOOLTIP = { tooltipWidth: 200, tooltipHeight: 60 };

describe('getTooltipPlacement', () => {
  it('위에 자리가 있으면 대상 위에 두고 아래를 가리킨다', () => {
    const result = getTooltipPlacement({
      target: { x: 180, y: 400, width: 60, height: 30 },
      ...TOOLTIP,
      ...SCREEN,
    });

    expect(result.tail).toBe('DOWN');
    expect(result.y).toBe(400 - 12 - 60);
  });

  it('위에 자리가 없으면 대상 아래에 두고 위를 가리킨다', () => {
    const result = getTooltipPlacement({
      target: { x: 180, y: 20, width: 60, height: 30 },
      ...TOOLTIP,
      ...SCREEN,
    });

    expect(result.tail).toBe('UP');
    expect(result.y).toBe(20 + 30 + 12);
  });

  it('BELOW를 원하면 자리가 있는 한 아래에 둔다', () => {
    const result = getTooltipPlacement({
      target: { x: 20, y: 400, width: 24, height: 24 },
      ...TOOLTIP,
      ...SCREEN,
      preferred: 'BELOW',
    });

    expect(result.tail).toBe('UP');
    expect(result.y).toBe(400 + 24 + 12);
  });

  it('원하는 쪽에 자리가 없으면 반대쪽으로 넘긴다', () => {
    const result = getTooltipPlacement({
      target: { x: 20, y: 780, width: 24, height: 24 },
      ...TOOLTIP,
      ...SCREEN,
      preferred: 'BELOW',
    });

    expect(result.tail).toBe('DOWN');
  });

  it('대상 중심에 말풍선을 맞춘다', () => {
    const result = getTooltipPlacement({
      target: { x: 180, y: 400, width: 60, height: 30 },
      ...TOOLTIP,
      ...SCREEN,
    });

    // 대상 중심 210 - 말풍선 절반 100
    expect(result.x).toBe(110);
  });

  it('오른쪽 끝 대상이어도 말풍선이 화면을 벗어나지 않는다', () => {
    const result = getTooltipPlacement({
      target: { x: 350, y: 400, width: 30, height: 30 },
      ...TOOLTIP,
      ...SCREEN,
    });

    expect(result.x + TOOLTIP.tooltipWidth).toBeLessThanOrEqual(SCREEN.screenWidth);
    // 말풍선이 안으로 밀려도 꼬리는 대상 쪽에 남는다
    expect(result.tailOffsetX).toBeGreaterThan(TOOLTIP.tooltipWidth / 2);
  });

  it('왼쪽 끝 대상이어도 말풍선이 화면을 벗어나지 않는다', () => {
    const result = getTooltipPlacement({
      target: { x: 4, y: 400, width: 30, height: 30 },
      ...TOOLTIP,
      ...SCREEN,
    });

    expect(result.x).toBeGreaterThanOrEqual(0);
    expect(result.tailOffsetX).toBeLessThan(TOOLTIP.tooltipWidth / 2);
  });
});

describe('buildDimPath', () => {
  it('바깥 사각형으로 화면 전체를 덮는다', () => {
    const path = buildDimPath([], 390, 844);

    expect(path.startsWith('M0,0 H390 V844 H0 Z')).toBe(true);
  });

  it('대상마다 구멍 경로를 하나씩 더한다', () => {
    const path = buildDimPath(
      [
        { x: 20, y: 200, width: 24, height: 24 },
        { x: 300, y: 200, width: 50, height: 24 },
      ],
      390,
      844,
    );

    // 바깥 1개 + 구멍 2개 = 경로 시작(M)이 3번
    expect(path.match(/M/g)).toHaveLength(3);
  });

  it('짧은 변의 절반을 반지름으로 써서 원·알약 모양이 된다', () => {
    const path = buildDimPath([{ x: 100, y: 200, width: 50, height: 24 }], 390, 844);

    // 높이 24의 절반인 12가 반지름
    expect(path).toContain('A12,12');
  });

  it('여백을 주면 구멍이 그만큼 넓어진다', () => {
    const path = buildDimPath([{ x: 100, y: 200, width: 24, height: 24 }], 390, 844, 6);

    // 여백을 더한 크기 36의 절반인 18이 반지름이고, 시작점은 (94+18, 200-6)
    expect(path).toContain('A18,18');
    expect(path).toContain('M112,194');
  });
});
