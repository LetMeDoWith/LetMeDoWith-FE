/*
 * 화면 바운더리: 에러 화면 전환·재시도·수집 분기 테스트.
 * React가 잡은 에러를 console.error로 찍으므로 테스트 동안 막는다.
 */
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';

const mockCaptureRenderError = jest.fn();
jest.mock('utils/sentry', () => ({
  captureRenderError: (...args: unknown[]) => mockCaptureRenderError(...args),
}));
jest.mock('react-native-safe-area-context', () => ({ initialWindowMetrics: null }));

import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

import { ErrorFallback } from 'components/common/ErrorFallback';
import { throwOnInitialError } from 'utils/error';
import { ScreenErrorBoundary, withScreenErrorBoundary } from 'components/common/ScreenErrorBoundary';

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

describe('ScreenErrorBoundary', () => {
  let consoleSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    mockCaptureRenderError.mockClear();
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    shouldThrow = null;
  });

  it('자식이 렌더 에러를 던지면 DEFAULT 에러 화면을 보이고 수집한다', () => {
    shouldThrow = new TypeError('render');
    const tree = renderer.create(
      <ScreenErrorBoundary>
        <Child />
      </ScreenErrorBoundary>,
    );
    expect(tree.root.findByType(ErrorFallback).props.variant).toBe('DEFAULT');
    expect(mockCaptureRenderError).toHaveBeenCalledWith(shouldThrow, 'screen');
  });

  it('응답 없는 axios 에러는 NETWORK 화면', () => {
    shouldThrow = Object.assign(new Error('Network Error'), { isAxiosError: true });
    const tree = renderer.create(
      <ScreenErrorBoundary>
        <Child />
      </ScreenErrorBoundary>,
    );
    expect(tree.root.findByType(ErrorFallback).props.variant).toBe('NETWORK');
  });

  it('다시 시도하면 자식을 다시 그린다', () => {
    shouldThrow = new TypeError('render');
    const tree = renderer.create(
      <ScreenErrorBoundary>
        <Child />
      </ScreenErrorBoundary>,
    );
    shouldThrow = null;
    pressRetry(tree);
    expect(tree.root.findAllByType(ErrorFallback)).toHaveLength(0);
    expect(tree.root.findByType(Text).props.children).toBe('content');
  });

  it('다시 시도했는데 또 실패하면 에러 화면이 다시 뜬다', () => {
    shouldThrow = new TypeError('render');
    const tree = renderer.create(
      <ScreenErrorBoundary>
        <Child />
      </ScreenErrorBoundary>,
    );
    pressRetry(tree);
    expect(tree.root.findAllByType(ErrorFallback)).toHaveLength(1);
  });

  it('withScreenErrorBoundary는 props를 그대로 넘기고 safe area 옵션을 전달한다', () => {
    const Screen = ({ label }: { label: string }) => <Text>{label}</Text>;
    const Wrapped = withScreenErrorBoundary(Screen, { withSafeAreaTop: true });
    const tree = renderer.create(<Wrapped label="hello" />);
    expect(tree.root.findByType(Text).props.children).toBe('hello');
    expect(Wrapped.displayName).toBe('withScreenErrorBoundary(Screen)');
  });
});

describe('withScreenErrorBoundary — 뒤로가기', () => {
  let consoleSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    shouldThrow = null;
  });

  /* 헤더까지 에러 화면으로 바뀌는 화면(할 일 수정)은 에러 화면에 나갈 수단이 있어야 한다(리뷰 I-4) */
  it('withBackButton이면 에러 화면의 뒤로가기가 navigation.goBack을 부른다', () => {
    shouldThrow = new TypeError('render');
    const goBack = jest.fn();
    const Screen = (_props: { navigation: { goBack: () => void } }) => <Child />;
    const Wrapped = withScreenErrorBoundary(Screen, { withBackButton: true });
    const tree = renderer.create(<Wrapped navigation={{ goBack }} />);

    act(() => {
      tree.root.findByProps({ testID: 'error-fallback-back' }).props.onPress();
    });
    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it('옵션이 없으면 뒤로가기 버튼을 그리지 않는다', () => {
    shouldThrow = new TypeError('render');
    const tree = renderer.create(
      <ScreenErrorBoundary>
        <Child />
      </ScreenErrorBoundary>,
    );
    expect(tree.root.findAllByProps({ testID: 'error-fallback-back' }).length).toBe(0);
  });
});

describe('ScreenErrorBoundary + react-query', () => {
  let consoleSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => consoleSpy.mockRestore());

  /*
   * 다른 화면의 던지지 않는 구독이 실패시켜 "에러 + 데이터 없음"으로 남은 조회를,
   * 핵심 화면이 처음 마운트될 때 재요청 없이 바로 에러 화면으로 보내면 안 된다(I-2).
   */
  it('이미 실패한 조회도 핵심 화면 첫 마운트 때 다시 요청한다', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const queryKey = ['__test__', 'already-failed'];
    await queryClient
      .fetchQuery({ queryKey, queryFn: () => Promise.reject(new Error('earlier failure')) })
      .catch(() => {});

    const CoreScreen = () => {
      const { data } = useQuery({
        queryKey,
        queryFn: () => Promise.resolve('fresh'),
        throwOnError: throwOnInitialError,
      });
      return <Text>{data ?? 'loading'}</Text>;
    };

    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <QueryClientProvider client={queryClient}>
          <ScreenErrorBoundary>
            <CoreScreen />
          </ScreenErrorBoundary>
        </QueryClientProvider>,
      );
    });
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    /* 실패 시 렌더 트리 전체를 출력하지 않도록 개수·문자열로 비교한다 */
    expect(tree.root.findAllByType(ErrorFallback).length).toBe(0);
    expect(tree.root.findAllByType(Text).map(node => node.props.children)).toEqual(['fresh']);
    queryClient.clear();
  });
});
