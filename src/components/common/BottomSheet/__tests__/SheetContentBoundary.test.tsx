/* 시트 내용 바운더리: 에러 시 내용 대신 아무것도 그리지 않고, 닫기 콜백·수집을 1회 부른다 */
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import renderer from 'react-test-renderer';
import { Text } from 'react-native';

const mockCaptureRenderError = jest.fn();
jest.mock('utils/sentry', () => ({
  captureRenderError: (...args: unknown[]) => mockCaptureRenderError(...args),
}));

import { SheetContentBoundary } from 'components/common/BottomSheet/SheetContentBoundary';

const Broken = () => {
  throw new TypeError('sheet render');
};

describe('SheetContentBoundary', () => {
  let consoleSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    mockCaptureRenderError.mockClear();
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => consoleSpy.mockRestore());

  it('정상일 때는 자식을 그린다', () => {
    const tree = renderer.create(
      <SheetContentBoundary onError={jest.fn()}>
        <Text>ok</Text>
      </SheetContentBoundary>,
    );
    expect(tree.root.findByType(Text).props.children).toBe('ok');
  });

  it('렌더 에러면 아무것도 그리지 않고 onError와 수집을 부른다', () => {
    const onError = jest.fn();
    const tree = renderer.create(
      <SheetContentBoundary onError={onError}>
        <Broken />
      </SheetContentBoundary>,
    );
    expect(tree.toJSON()).toBeNull();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(mockCaptureRenderError).toHaveBeenCalledWith(expect.any(TypeError), 'bottom-sheet');
  });
});
