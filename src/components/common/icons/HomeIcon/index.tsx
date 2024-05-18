import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

import { theme } from 'styles/theme';

const HomeIcon = ({
  width = 20,
  height = 22,
  fill = 'none',
  stroke = theme.COLORS.GRAY_SCALE.GRAY_600,
}: Pick<SvgProps, 'width' | 'height'> & { fill?: string; stroke?: string }) => {
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill={fill}>
      <Path
        d="M19 7.375V20.875H12.875V13.0625V12.5625H12.375H7.625H7.125V13.0625V20.875H1V7.375L10 0.625L19 7.375Z"
        stroke={stroke}
      />
    </Svg>
  );
};

export { HomeIcon };
