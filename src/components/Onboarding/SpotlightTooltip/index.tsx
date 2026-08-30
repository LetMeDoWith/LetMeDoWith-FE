import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from 'styles/theme';
import type { TooltipPlacement } from 'utils/onboarding';

interface Props {
  message: string;
  placement: TooltipPlacement;
  /* 문구 정렬. 시안에서 말풍선마다 다르다. */
  align?: 'left' | 'right';
  /* 크기를 알아야 위치를 정할 수 있어, 처음 렌더에서 재서 올려보낸다. */
  onLayoutSize?: (size: { width: number; height: number }) => void;
}

const TAIL_SIZE = 8;

/* 대상을 가리키는 말풍선. 꼬리 방향과 가로 위치는 배치 계산이 정해준다. */
const SpotlightTooltip = ({ message, placement, align = 'left', onLayoutSize }: Props) => (
  <View
    style={[styles.container, { left: placement.x, top: placement.y }]}
    onLayout={({ nativeEvent: { layout } }) => onLayoutSize?.({ width: layout.width, height: layout.height })}
    pointerEvents="none"
  >
    {placement.tail === 'UP' && (
      <View style={[styles.tail, styles.tailUp, { left: placement.tailOffsetX - TAIL_SIZE }]} />
    )}
    <View style={styles.bubble}>
      <Text style={[styles.message, { textAlign: align }]}>{message}</Text>
    </View>
    {placement.tail === 'DOWN' && (
      <View style={[styles.tail, styles.tailDown, { left: placement.tailOffsetX - TAIL_SIZE }]} />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: 260,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_20,
  },
  message: {
    ...theme.TYPOGRAPHY.CAPTION1_BASIC,
    color: theme.COLORS.DEFAULT.WHITE,
  },
  /* 삼각 꼬리는 테두리 트릭으로 그린다(도형 하나 추가 없이). */
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: TAIL_SIZE,
    borderRightWidth: TAIL_SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  tailUp: {
    borderBottomWidth: TAIL_SIZE,
    borderBottomColor: theme.COLORS.GRAY_SCALE.GRAY_20,
  },
  tailDown: {
    borderTopWidth: TAIL_SIZE,
    borderTopColor: theme.COLORS.GRAY_SCALE.GRAY_20,
  },
});

export { SpotlightTooltip };
