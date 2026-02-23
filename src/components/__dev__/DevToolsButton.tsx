import React, { useCallback, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface DevToolsButtonProps {
  label: string;
  doneLabel?: string;
  color?: string;
  onPress: () => void | Promise<void>;
}

const DevToolsButton = ({ label, doneLabel = 'Done', color = '#E06C75', onPress }: DevToolsButtonProps) => {
  const scale = useSharedValue(1);
  const [showDone, setShowDone] = useState(false);

  const handlePress = useCallback(async () => {
    await onPress();
    setShowDone(true);
    setTimeout(() => setShowDone(false), 800);
  }, [onPress]);

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withTiming(0.85, { duration: 80 });
    })
    .onFinalize(() => {
      scale.value = withSequence(withTiming(1.1, { duration: 100 }), withTiming(1, { duration: 100 }));
      runOnJS(handlePress)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.btn, animatedStyle]}>
        <Text style={[styles.label, { color }]}>{showDone ? `✓ ${doneLabel}` : label}</Text>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#333',
    borderRadius: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export { DevToolsButton };
