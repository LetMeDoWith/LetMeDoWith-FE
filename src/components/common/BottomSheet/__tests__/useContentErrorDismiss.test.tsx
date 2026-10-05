/*
 * 시트 내용 렌더 에러 시 닫기. gorhom 모달은 여는 애니메이션이 끝나기 전 dismiss()를 무시하므로,
 * 열림이 확정되는 순간(onChange index >= 0)에 다시 닫아야 한다(리뷰 I-1).
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import React from 'react';
import renderer, { act } from 'react-test-renderer';

const mockShowSnackbar = jest.fn();
jest.mock('stores/snackbarStore', () => ({
  showSnackbar: (...args: unknown[]) => mockShowSnackbar(...args),
  SNACKBAR_TYPE: { ERROR: 'ERROR' },
}));

import { useContentErrorDismiss } from 'components/common/BottomSheet/useContentErrorDismiss';

type HookResult = ReturnType<typeof useContentErrorDismiss>;

const setup = () => {
  const dismiss = jest.fn();
  const sheetRef = { current: { dismiss } };
  let result!: HookResult;
  const Harness = () => {
    result = useContentErrorDismiss(sheetRef);
    return null;
  };
  renderer.create(<Harness />);
  return { dismiss, get: () => result };
};

describe('useContentErrorDismiss', () => {
  beforeEach(() => {
    mockShowSnackbar.mockClear();
  });

  it('여는 중에 에러가 나면 열림이 확정될 때 다시 닫는다', () => {
    const { dismiss, get } = setup();
    act(() => get().handleContentError());
    expect(get().hasContentError).toBe(true);
    expect(mockShowSnackbar).toHaveBeenCalledTimes(1);

    act(() => get().handleSheetChange(0));
    expect(dismiss).toHaveBeenCalledTimes(2);
  });

  it('닫히면 에러 상태가 풀리고, 다음에 열 때는 닫지 않는다', () => {
    const { dismiss, get } = setup();
    act(() => get().handleContentError());
    act(() => get().handleSheetChange(-1));
    expect(get().hasContentError).toBe(false);

    dismiss.mockClear();
    act(() => get().handleSheetChange(0));
    expect(dismiss).not.toHaveBeenCalled();
  });
});
