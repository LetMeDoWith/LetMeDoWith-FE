/* 화면 좌표계의 사각형. measureInWindow가 돌려주는 값과 같은 형태다. */
interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TooltipPlacementParams {
  /* 가리킬 대상의 화면상 위치 */
  target: Rect;
  /* 말풍선 크기(측정 후 전달) */
  tooltipWidth: number;
  tooltipHeight: number;
  screenWidth: number;
  screenHeight: number;
  /*
   * 두고 싶은 쪽. 말풍선이 여럿일 때 자동 판정만 쓰면 모두 같은 쪽으로 몰려 겹친다.
   * 원하는 쪽에 자리가 없으면 반대쪽으로 넘긴다.
   */
  preferred?: 'ABOVE' | 'BELOW';
}

interface TooltipPlacement {
  x: number;
  y: number;
  /* 꼬리가 아래를 향하면 말풍선이 대상 위에 있다는 뜻 */
  tail: 'DOWN' | 'UP';
  /* 말풍선 기준 꼬리의 가로 위치. 말풍선이 화면 안으로 밀려도 꼬리는 대상을 계속 가리킨다. */
  tailOffsetX: number;
}

/* 말풍선과 대상 사이 간격 */
const TOOLTIP_GAP = 12;
/* 말풍선이 화면 가장자리에 붙지 않도록 남기는 여백 */
const SCREEN_PADDING = 16;
/* 꼬리가 말풍선 모서리를 벗어나지 않도록 남기는 여백 */
const TAIL_EDGE_PADDING = 16;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/*
 * 말풍선을 대상 위/아래 중 어디에 둘지와 그 좌표를 정한다.
 *
 * preferred로 원하는 쪽을 지정한다(시안: ⚡칩 안내는 위, 상태 원 안내는 아래).
 * 지정한 쪽에 자리가 없으면 반대쪽으로 넘긴다.
 * 가로는 대상 중심에 맞추되 화면을 벗어나면 안으로 밀고, 꼬리만 대상 쪽에 남긴다.
 */
const getTooltipPlacement = ({
  target,
  tooltipWidth,
  tooltipHeight,
  screenWidth,
  screenHeight,
  preferred = 'ABOVE',
}: TooltipPlacementParams): TooltipPlacement => {
  const needed = tooltipHeight + TOOLTIP_GAP + SCREEN_PADDING;
  const fitsAbove = target.y >= needed;
  const fitsBelow = screenHeight - (target.y + target.height) >= needed;
  const placeAbove = preferred === 'ABOVE' ? fitsAbove : !fitsBelow && fitsAbove;

  const y = placeAbove ? target.y - TOOLTIP_GAP - tooltipHeight : target.y + target.height + TOOLTIP_GAP;

  const targetCenterX = target.x + target.width / 2;
  const maxX = Math.max(SCREEN_PADDING, screenWidth - SCREEN_PADDING - tooltipWidth);
  const x = clamp(targetCenterX - tooltipWidth / 2, SCREEN_PADDING, maxX);

  const tailOffsetX = clamp(
    targetCenterX - x,
    TAIL_EDGE_PADDING,
    Math.max(TAIL_EDGE_PADDING, tooltipWidth - TAIL_EDGE_PADDING),
  );

  return {
    x,
    y: clamp(y, SCREEN_PADDING, Math.max(SCREEN_PADDING, screenHeight - SCREEN_PADDING - tooltipHeight)),
    tail: placeAbove ? 'DOWN' : 'UP',
    tailOffsetX,
  };
};

/*
 * 화면 전체를 덮되 대상 자리에는 구멍이 뚫린 하나의 경로를 만든다.
 *
 * 사각형 View를 조각내는 방식으로는 둥근 구멍을 만들 수 없어, 대상이 알약·원 모양인
 * 시안과 어긋난다. 바깥 사각형과 대상들을 한 경로에 담고 evenodd 규칙으로 칠하면
 * 대상 부분만 비워진다.
 *
 * SVG Mask를 쓰지 않는 이유는 이 프로젝트에서 Mask가 안드로이드에서 오프스크린
 * 래스터화로 흐려지는 문제를 겪었기 때문이다(기본 프로필·달력 체크).
 */
const buildDimPath = (targets: Rect[], screenWidth: number, screenHeight: number, padding = 0): string => {
  const outer = `M0,0 H${screenWidth} V${screenHeight} H0 Z`;

  const holes = targets.map(({ x, y, width, height }) => {
    const left = x - padding;
    const top = y - padding;
    const w = width + padding * 2;
    const h = height + padding * 2;
    /* 대상이 원·알약이라 짧은 변의 절반을 반지름으로 쓰면 모양이 맞는다. */
    const r = Math.min(w, h) / 2;
    const right = left + w;
    const bottom = top + h;

    return [
      `M${left + r},${top}`,
      `H${right - r}`,
      `A${r},${r} 0 0 1 ${right},${top + r}`,
      `V${bottom - r}`,
      `A${r},${r} 0 0 1 ${right - r},${bottom}`,
      `H${left + r}`,
      `A${r},${r} 0 0 1 ${left},${bottom - r}`,
      `V${top + r}`,
      `A${r},${r} 0 0 1 ${left + r},${top}`,
      'Z',
    ].join(' ');
  });

  return [outer, ...holes].join(' ');
};

export { getTooltipPlacement, buildDimPath, TOOLTIP_GAP };
export type { Rect, TooltipPlacement };
