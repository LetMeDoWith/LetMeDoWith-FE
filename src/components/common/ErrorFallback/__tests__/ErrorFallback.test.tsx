/*
 * 에러 화면 문구·재시도·안전 영역 분기 테스트.
 * 루트 대체 화면은 Provider 밖에서도 그려지므로 Provider 없이 렌더한다.
 */
import { describe, it, expect, jest } from '@jest/globals';
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text, View } from 'react-native';

jest.mock('react-native-safe-area-context', () => ({
  initialWindowMetrics: {
    insets: { top: 47, bottom: 34, left: 0, right: 0 },
    frame: { x: 0, y: 0, width: 0, height: 0 },
  },
}));

import { ErrorFallback } from 'components/common/ErrorFallback';

const texts = (tree: renderer.ReactTestRenderer) =>
  tree.root.findAllByType(Text).map(node => node.props.children as string);

describe('ErrorFallback', () => {
  it('NETWORK 문구를 보여준다', () => {
    const tree = renderer.create(<ErrorFallback variant="NETWORK" onRetry={jest.fn()} />);
    expect(texts(tree)).toEqual(
      expect.arrayContaining([
        '인터넷 연결을 확인해주세요.',
        '연결이 잠시 끊겼어요.\n인터넷 연결을 확인하고 다시 시도해 주세요.',
        '다시 시도하기',
      ]),
    );
  });

  it('DEFAULT 문구를 보여준다', () => {
    const tree = renderer.create(<ErrorFallback variant="DEFAULT" onRetry={jest.fn()} />);
    expect(texts(tree)).toEqual(
      expect.arrayContaining(['데이터를 불러오지 못했어요.', '불러오기에 실패했어요.\n잠시 후 다시 시도해 주세요.']),
    );
  });

  it('다시 시도하기를 누르면 onRetry를 부른다', () => {
    const onRetry = jest.fn();
    const tree = renderer.create(<ErrorFallback variant="DEFAULT" onRetry={onRetry} />);
    act(() => {
      tree.root.findByProps({ testID: 'error-fallback-retry' }).props.onPress();
    });
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('withSafeAreaTop이면 상단 안전 영역만큼 여백을 둔다', () => {
    const tree = renderer.create(<ErrorFallback variant="DEFAULT" onRetry={jest.fn()} withSafeAreaTop />);
    const container = tree.root.findAllByType(View)[0];
    expect(container.props.style).toEqual(expect.arrayContaining([{ paddingTop: 47 }]));
  });
});
