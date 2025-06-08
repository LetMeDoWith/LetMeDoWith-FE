/**
 * 값이 null 또는 undefined인지 확인하는 유틸 함수.
 *
 * @param value - 검사할 값
 * @returns {boolean} 값이 null 또는 undefined이면 true, 아니면 false를 반환.
 */
const isNil = (value: unknown): boolean => value === null || value === undefined;

export { isNil };
