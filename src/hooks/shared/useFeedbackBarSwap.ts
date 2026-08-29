import { useCallback, useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';

/* 영상 기준 전환 시간. 상태 전환을 이어주는 정도이지 연출이 아니므로 짧게 유지한다. */
const SWAP_DURATION = 150;

/*
 * 본 동작 직전에 반대 방향으로 살짝 움직이는 예비 동작(앤티시페이션).
 * 펼칠 때는 위로, 접을 때는 아래로 먼저 튄 뒤 목표 높이로 간다.
 */
const BOUNCE_OFFSET = 8;
const BOUNCE_DURATION = 90;

interface Params {
  // 잡도리 선택 바가 펼쳐진 상태인지
  showReactions: boolean;
  // "보낸 잡도리" 바를 표시할 내용이 있는지
  hasFeedbacks: boolean;
  // 위 콘텐츠와의 간격. 접힌 상태에서 빈 공간이 남지 않도록 애니메이션 높이에 포함시킨다.
  gap: number;
}

/*
 * 잡도리 선택 바와 "보낸 잡도리" 바를 같은 자리에 겹쳐 두고 opacity로 교차시킨다.
 * 두 바의 높이가 달라 컨테이너 높이도 함께 애니메이션해야 아래 콘텐츠가 튀지 않는다.
 * 높이는 각 레이어의 onLayout으로 측정한다(절대 배치여도 자연 높이가 보고된다).
 */
const useFeedbackBarSwap = ({ showReactions, hasFeedbacks, gap }: Params) => {
  const [reactionHeight, setReactionHeight] = useState(0);
  const [sentHeight, setSentHeight] = useState(0);

  /* 0: "보낸 잡도리" 바, 1: 선택 바 */
  const progress = useSharedValue(showReactions ? 1 : 0);
  const height = useSharedValue(0);
  const isFirstLayout = useRef(true);

  const barHeight = showReactions ? reactionHeight : hasFeedbacks ? sentHeight : 0;
  const targetHeight = barHeight === 0 ? 0 : barHeight + gap;

  useEffect(() => {
    /* 예비 동작이 끝나고 실제로 높이가 움직이기 시작할 때 교차되도록 늦춘다. */
    progress.value = withDelay(BOUNCE_DURATION, withTiming(showReactions ? 1 : 0, { duration: SWAP_DURATION }));
  }, [showReactions, progress]);

  useEffect(() => {
    /*
     * 접힌 상태로 시작하는 항목(보낸 잡도리 없음)은 첫 렌더에서 높이가 0이다.
     * 이때 isFirstLayout을 소진하지 않아야, 나중에 처음 펼칠 때도 애니메이션이 돈다.
     */
    if (isFirstLayout.current && targetHeight > 0) {
      isFirstLayout.current = false;
      /* 이미 펼쳐진 채 등장하는 경우에만 애니메이션 없이 확정한다(진입 때마다 덜컹거리지 않게). */
      if (!showReactions) {
        height.value = targetHeight;
        return;
      }
    }

    /*
     * 목표와 반대 방향으로 BOUNCE_OFFSET만큼 먼저 움직인 뒤 목표 높이로 간다.
     * 펼칠 때(높이 증가)는 위로 = 더 줄이고, 접을 때(높이 감소)는 아래로 = 더 늘린다.
     * 높이는 음수가 될 수 없으므로 0에서 시작하는 경우는 예비 동작이 생략된다.
     */
    const currentHeight = height.value;
    const isExpanding = targetHeight > currentHeight;
    const anticipationHeight = isExpanding ? Math.max(0, currentHeight - BOUNCE_OFFSET) : currentHeight + BOUNCE_OFFSET;

    height.value = withSequence(
      withTiming(anticipationHeight, { duration: BOUNCE_DURATION, easing: Easing.out(Easing.quad) }),
      withTiming(targetHeight, { duration: SWAP_DURATION, easing: Easing.out(Easing.cubic) }),
    );
  }, [targetHeight, showReactions, height]);

  const handleReactionLayout = useCallback((e: LayoutChangeEvent) => {
    setReactionHeight(e.nativeEvent.layout.height);
  }, []);

  const handleSentLayout = useCallback((e: LayoutChangeEvent) => {
    setSentHeight(e.nativeEvent.layout.height);
  }, []);

  const containerAnimatedStyle = useAnimatedStyle(() => ({ height: height.value }));
  const reactionAnimatedStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sentAnimatedStyle = useAnimatedStyle(() => ({ opacity: 1 - progress.value }));
  /* 더하기 아이콘을 45도 돌리면 닫기(x) 모양이 된다. 아이콘을 갈아끼우지 않아 전환이 끊기지 않는다. */
  const toggleAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${progress.value * 45}deg` }] }));

  return {
    containerAnimatedStyle,
    reactionAnimatedStyle,
    sentAnimatedStyle,
    toggleAnimatedStyle,
    handleReactionLayout,
    handleSentLayout,
  };
};

export { useFeedbackBarSwap };
