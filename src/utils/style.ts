/**
 * 색상 헥사 코드를 RGBA로 변환하는 함수
 * @param hex 변환하려는 색상 헥사 코드
 * @param alpha 변환하려는 opacity 값
 */
const hexToRgba = (hex: `#${string}`, alpha = 1) => {
  // 헥사 코드가 올바른지 검사 (#RRGGBB 또는 #RRGGBBAA 형식)
  const hexRegex = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
  if (!hexRegex.test(hex)) {
    throw new Error('유효한 헥사 코드 형식이 아닙니다. #RRGGBB 또는 #RRGGBBAA 형식이어야 합니다.');
  }

  // 헥사 코드에서 #을 제거
  const cleanHex = hex.replace('#', '');

  // RGB 값 추출
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // RGBA 형식으로 반환
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export { hexToRgba };
