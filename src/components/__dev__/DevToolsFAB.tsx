import React from 'react';
import { Dimensions, StyleSheet, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

const SIZE = 48;
const EDGE_MARGIN = 16;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DevToolsFABProps {
  onPress: () => void;
}

const DevToolsFAB = ({ onPress }: DevToolsFABProps) => {
  const translateX = useSharedValue(SCREEN_WIDTH - SIZE - EDGE_MARGIN);
  const translateY = useSharedValue(SCREEN_HEIGHT - SIZE - 120);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const scale = useSharedValue(1);

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withTiming(0.8, { duration: 100 });
    })
    .onEnd(() => {
      scale.value = withSequence(
        withSpring(1.1, { damping: 15, stiffness: 300 }),
        withSpring(1, { damping: 15, stiffness: 300 }),
      );
      runOnJS(onPress)();
    })
    .onFinalize((_, success) => {
      if (!success) {
        scale.value = withSpring(1);
      }
    });

  const panGesture = Gesture.Pan()
    .minDistance(10)
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate(event => {
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
    })
    .onEnd(() => {
      // 가까운 좌/우 가장자리로 스냅
      const midX = SCREEN_WIDTH / 2;
      const currentCenterX = translateX.value + SIZE / 2;
      const snapX = currentCenterX < midX ? EDGE_MARGIN : SCREEN_WIDTH - SIZE - EDGE_MARGIN;
      translateX.value = withSpring(snapX, { damping: 20, stiffness: 200 });

      // 수직 위치 제한
      const clampedY = Math.max(EDGE_MARGIN + 60, Math.min(translateY.value, SCREEN_HEIGHT - SIZE - EDGE_MARGIN));
      translateY.value = withSpring(clampedY, { damping: 20, stiffness: 200 });
    });

  // Pan 우선; 이동 거리 < minDistance이면 탭으로 처리
  const composedGesture = Gesture.Exclusive(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.fab, animatedStyle]}>
        <Text style={styles.icon}>{'</>'}</Text>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#3C3C3C',
  },
  icon: {
    color: '#61DAFB',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
});

export { DevToolsFAB };
