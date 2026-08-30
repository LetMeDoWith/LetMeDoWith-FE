import React, { useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { SpotlightTooltip } from 'components/Onboarding/SpotlightTooltip';
import { theme } from 'styles/theme';
import { buildDimPath, getTooltipPlacement } from 'utils/onboarding';
import type { Rect } from 'utils/onboarding';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/*
 * 구멍을 대상보다 얼마나 넓게 뚫을지. 0이면 요소 크기에 딱 맞는다.
 * 키우면 요소 둘레에 흰 여백이 생겨 시안보다 커 보인다.
 */
const SPOTLIGHT_PADDING = 0;
/* 말풍선 크기를 재기 전에 쓸 임시값. 첫 렌더에서 실제 크기로 대체된다. */
const INITIAL_TOOLTIP_SIZE = { width: 220, height: 64 };

interface Props {
  /* 가리킬 대상들의 화면 좌표 */
  thunderTarget: Rect;
  statusTarget: Rect;
  onClose: () => void;
}

interface TooltipSize {
  width: number;
  height: number;
}

/*
 * 첫 두윗 등록 후 한 번 보여주는 코치마크.
 *
 * 딤에 구멍을 뚫는 데 SVG Mask를 쓰지 않고 조각난 View 넷으로 덮는다.
 * 이 프로젝트에서 Mask는 안드로이드에서 오프스크린 래스터화로 흐려지는 문제를 겪었다.
 */
const DowithCoachMark = ({ thunderTarget, statusTarget, onClose }: Props) => {
  const [thunderSize, setThunderSize] = useState<TooltipSize>(INITIAL_TOOLTIP_SIZE);
  const [statusSize, setStatusSize] = useState<TooltipSize>(INITIAL_TOOLTIP_SIZE);

  /* 대상 모양대로 구멍이 뚫린 딤 경로 */
  const dimPath = buildDimPath([statusTarget, thunderTarget], SCREEN_WIDTH, SCREEN_HEIGHT, SPOTLIGHT_PADDING);

  const thunderPlacement = getTooltipPlacement({
    target: thunderTarget,
    tooltipWidth: thunderSize.width,
    tooltipHeight: thunderSize.height,
    screenWidth: SCREEN_WIDTH,
    screenHeight: SCREEN_HEIGHT,
    /* 시안대로 ⚡칩 안내는 위, 상태 원 안내는 아래에 둔다. 둘 다 자동에 맡기면 같은 쪽으로 몰려 겹친다. */
    preferred: 'ABOVE',
  });

  const statusPlacement = getTooltipPlacement({
    target: statusTarget,
    tooltipWidth: statusSize.width,
    tooltipHeight: statusSize.height,
    screenWidth: SCREEN_WIDTH,
    screenHeight: SCREEN_HEIGHT,
    preferred: 'BELOW',
  });

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      {/* 대상 자리는 비워 두어 아래 화면이 그대로 보인다. evenodd로 구멍을 만든다. */}
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Path d={dimPath} fill={theme.COLORS.DEFAULT.BLACK} fillOpacity={0.6} fillRule="evenodd" />
      </Svg>
      <SpotlightTooltip
        message="다른 사용자들이 보낸 잡도리 갯수를 확인할 수 있어요."
        placement={thunderPlacement}
        onLayoutSize={setThunderSize}
      />
      <SpotlightTooltip
        message="잡도리 폭탄을 막으려면 버튼을 눌러 인증 사진을 올려야 해요!"
        placement={statusPlacement}
        onLayoutSize={setStatusSize}
      />

      <Pressable style={styles.nextButton} onPress={onClose}>
        <Text style={styles.nextButtonText}>다음</Text>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  nextButton: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 40,
    height: 56,
    borderRadius: 12,
    backgroundColor: theme.COLORS.PRIMARY.RED_60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    ...theme.TYPOGRAPHY.TITLE_3,
    color: theme.COLORS.DEFAULT.WHITE,
  },
});

export { DowithCoachMark };
