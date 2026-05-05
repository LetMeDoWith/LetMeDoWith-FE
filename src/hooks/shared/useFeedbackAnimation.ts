import { useCallback, useState } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

import type { taskFeedbackTemplateSchemeType } from 'types/feedback/scheme/api';

const useFeedbackAnimation = () => {
  const [animatingTemplate, setAnimatingTemplate] = useState<taskFeedbackTemplateSchemeType | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationTrigger, setAnimationTrigger] = useState(0);

  const contentOpacity = useSharedValue(1);
  const emojiOpacity = useSharedValue(0);
  const emojiScale = useSharedValue(0.5);
  const emojiRotateY = useSharedValue(0);

  const onAnimationEnd = useCallback(() => {
    setIsAnimating(false);
    setAnimatingTemplate(null);
  }, []);

  const startAnimation = useCallback(
    (template: taskFeedbackTemplateSchemeType) => {
      setAnimatingTemplate(template);
      setIsAnimating(true);
      setAnimationTrigger(prev => prev + 1);

      // 타임라인: fade-out(0~200) → emoji in(200~400) → 회전(400~1600) → 대기(1600~2100) → 복귀(2100~2300)

      // contentOpacity: 1→0 (fade-out) → 대기 → 0→1 (fade-in 복귀)
      contentOpacity.value = withSequence(
        withTiming(0, { duration: 200 }),
        withDelay(
          1900,
          withTiming(1, { duration: 200 }, () => runOnJS(onAnimationEnd)()),
        ),
      );

      // emojiOpacity: 0→1 (fade-in) → 대기 → 1→0 (fade-out)
      emojiOpacity.value = withSequence(
        withDelay(200, withTiming(1, { duration: 200 })),
        withDelay(1700, withTiming(0, { duration: 200 })),
      );

      // emojiScale: 0.5→1.2 (scale-up) → 대기 → 1.2→0.5 (scale-down)
      emojiScale.value = withSequence(
        withDelay(200, withTiming(1.2, { duration: 200 })),
        withDelay(1700, withTiming(0.5, { duration: 200 })),
      );

      // emojiRotateY: 0→360(1바퀴) → 360→720(2바퀴, 감속) → 대기 → 리셋
      emojiRotateY.value = withSequence(
        withDelay(400, withTiming(360, { duration: 400, easing: Easing.inOut(Easing.ease) })),
        withTiming(720, { duration: 800, easing: Easing.out(Easing.cubic) }),
        withDelay(700, withTiming(0, { duration: 0 })),
      );
    },
    [contentOpacity, emojiOpacity, emojiScale, emojiRotateY, onAnimationEnd],
  );

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const emojiAnimatedStyle = useAnimatedStyle(() => ({
    opacity: emojiOpacity.value,
    transform: [{ scale: emojiScale.value }, { perspective: 800 }, { rotateY: `${emojiRotateY.value}deg` }],
  }));

  return {
    isAnimating,
    animatingTemplate,
    animationTrigger,
    contentAnimatedStyle,
    emojiAnimatedStyle,
    startAnimation,
  };
};

export { useFeedbackAnimation };
