import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

import { theme } from 'styles/theme';

const LikeIcon = ({
  width = 24,
  height = 24,
  fill = 'none',
  stroke = theme.COLORS.GRAY_SCALE.GRAY_60,
}: Pick<SvgProps, 'width' | 'height'> & { fill?: string; stroke?: string }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill={fill}>
      <Path
        d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export { LikeIcon };
