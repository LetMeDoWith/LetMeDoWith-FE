/*
 * 화면 바운더리의 에러 화면 표시 추적 테스트. 표시 카운터는 모듈 상태라,
 * 다른 테스트가 남긴 에러 화면이 섞이지 않도록 별도 파일(별도 모듈 레지스트리)로 둔다.
 */
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';

jest.mock('utils/sentry', () => ({ captureRenderError: jest.fn() }));
jest.mock('react-native-safe-area-context', () => ({ initialWindowMetrics: null }));

import { ScreenErrorBoundary } from 'components/common/ScreenErrorBoundary';
import { isErrorScreenShowing } from 'utils/error';

let shouldThrow: unknown = null;
const Child = () => {
  if (shouldThrow) {
    throw shouldThrow;
  }
  return <Text>content</Text>;
};

const pressRetry = (tree: renderer.ReactTestRenderer) =>
  act(() => {
    tree.root.findByProps({ testID: 'error-fallback-retry' }).props.onPress();
  });

describe('ScreenErrorBoundary — 에러 화면 표시 추적', () => {
  let consoleSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    shouldThrow = null;
  });

  it('에러 화면이 뜨면 표시 중, 다시 시도로 복구되면 해제', () => {
    shouldThrow = new TypeError('render');
    const tree = renderer.create(
      <ScreenErrorBoundary>
        <Child />
      </ScreenErrorBoundary>,
    );
    expect(isErrorScreenShowing()).toBe(true);

    shouldThrow = null;
    pressRetry(tree);
    expect(isErrorScreenShowing()).toBe(false);
  });

  it('에러 화면인 채로 화면이 사라지면 해제', () => {
    shouldThrow = new TypeError('render');
    const tree = renderer.create(
      <ScreenErrorBoundary>
        <Child />
      </ScreenErrorBoundary>,
    );
    act(() => tree.unmount());
    expect(isErrorScreenShowing()).toBe(false);
  });
});
