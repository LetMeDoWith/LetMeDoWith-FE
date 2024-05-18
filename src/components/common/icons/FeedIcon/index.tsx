import React from 'react';
import Svg, { Path, Rect, SvgProps } from 'react-native-svg';

import { theme } from 'styles/theme';

const FeedIcon = ({
  width = 22,
  height = 22,
  fill = 'none',
  fillRect = theme.COLORS.GRAY_SCALE.GRAY_600,
  stroke = theme.COLORS.GRAY_SCALE.GRAY_600,
}: Pick<SvgProps, 'width' | 'height'> & { fill?: string; fillRect?: string; stroke?: string }) => {
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill={fill}>
      <Path
        d="M17.4576 16.7504L17.3111 16.604H17.104H2.138C1.23824 16.604 0.5 15.8658 0.5 14.966V2.138C0.5 1.23824 1.23824 0.5 2.138 0.5H19.242C20.1418 0.5 20.88 1.23824 20.88 2.138V20.1729L17.4576 16.7504Z"
        stroke={stroke}
      />
      <Rect x="4.81055" y="3.20703" width="2.138" height="6.414" rx="1.069" fill={fillRect} />
      <Rect x="10.1558" y="3.20703" width="2.138" height="6.414" rx="1.069" fill={fillRect} />
    </Svg>
  );
};

export { FeedIcon };
