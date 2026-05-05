import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const DEFAULT_COLORS = ['#FF6B6B', '#FFE66D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FF9FF3', '#54A0FF'];
const DEFAULT_COUNT = 12;
const DEFAULT_DELAY = 0;

interface ConfettiEffectProps {
  children: React.ReactNode;
  trigger: number;
  count?: number;
  colors?: string[];
  delay?: number;
  style?: ViewStyle;
}

const ConfettiEffect = ({
  children,
  trigger,
  count = DEFAULT_COUNT,
  colors = DEFAULT_COLORS,
  delay = DEFAULT_DELAY,
  style,
}: ConfettiEffectProps) => (
  <View style={[styles.container, style]}>
    {children}
    {trigger > 0 &&
      Array.from({ length: count }, (_, i) => (
        <ConfettiParticle key={i} color={colors[i % colors.length]} trigger={trigger} delay={delay} />
      ))}
  </View>
);

interface ConfettiParticleProps {
  color: string;
  trigger: number;
  delay: number;
}

const ConfettiParticle = React.memo(({ color, trigger, delay }: ConfettiParticleProps) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);
  const rotate = useSharedValue(0);

  const config = useMemo(
    () => ({
      angle: Math.random() * Math.PI * 2,
      distance: 60 + Math.random() * 40,
      randomScale: 0.8 + Math.random() * 0.4,
      randomRotate: Math.random() * 720 - 360,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trigger],
  );

  useEffect(() => {
    if (trigger === 0) {
      return;
    }

    const targetX = Math.cos(config.angle) * config.distance;
    const targetY = Math.sin(config.angle) * config.distance;

    opacity.value = withDelay(
      delay,
      withSequence(withTiming(1, { duration: 100 }), withDelay(400, withTiming(0, { duration: 200 }))),
    );
    scale.value = withDelay(
      delay,
      withSequence(withTiming(config.randomScale, { duration: 150 }), withDelay(350, withTiming(0, { duration: 200 }))),
    );
    translateX.value = withDelay(
      delay,
      withSequence(
        withTiming(targetX, { duration: 500, easing: Easing.out(Easing.cubic) }),
        withDelay(600, withTiming(0, { duration: 0 })),
      ),
    );
    translateY.value = withDelay(
      delay,
      withSequence(
        withTiming(targetY, { duration: 500, easing: Easing.out(Easing.cubic) }),
        withDelay(600, withTiming(0, { duration: 0 })),
      ),
    );
    rotate.value = withDelay(delay, withTiming(config.randomRotate, { duration: 500 }));
  }, [trigger, config, delay, opacity, scale, translateX, translateY, rotate]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return <Animated.View style={[styles.particle, { backgroundColor: color }, animatedStyle]} />;
});

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export { ConfettiEffect };
