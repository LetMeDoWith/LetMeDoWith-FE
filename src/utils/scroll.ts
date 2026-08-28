/* 펼쳐진 요소가 화면 하단에 딱 붙지 않도록 두는 최소 여백 */
const REVEAL_MARGIN = 16;

/*
 * 펼쳐진 요소가 화면 아래로 가려질 때, 가려진 만큼 내리기 위한 스크롤 오프셋을 계산한다.
 * 이미 다 보이면 null을 돌려줘 호출부가 스크롤을 건너뛰게 한다.
 *
 * 위치와 무관하게 항목을 뷰포트 하단에 정렬하는 방식(scrollToIndex viewPosition:1)은
 * 이미 보이는 항목에서도 목록이 위로 튄다.
 */
const getRevealScrollOffset = ({
  elementBottomY,
  visibleBottom,
  currentOffset,
}: {
  /* 펼쳐진 요소의 화면상 하단 Y (measureInWindow 기준) */
  elementBottomY: number;
  /* 콘텐츠가 실제로 보이는 하단 Y (화면 높이에서 탭바·safe area를 뺀 값) */
  visibleBottom: number;
  /* 현재 스크롤 오프셋 */
  currentOffset: number;
}): number | null => {
  const overflow = elementBottomY - visibleBottom + REVEAL_MARGIN;

  if (overflow <= 0) {
    return null;
  }

  return currentOffset + overflow;
};

export { getRevealScrollOffset };
