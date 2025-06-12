import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

import { theme } from 'styles/theme';

const DropArrow = ({
  width = 16,
  height = 16,
  fill = theme.COLORS.GRAY_SCALE.GRAY_70,
  direction = 'UP',
}: Pick<SvgProps, 'width' | 'height'> & { fill?: string; direction?: 'UP' | 'DOWN' }) => (
  <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
    <Path
      d="M7.24074 5.3858C7.63984 4.92019 8.36016 4.92019 8.75926 5.3858L12.585 9.84921C13.141 10.4979 12.6801 11.5 11.8258 11.5H4.17422C3.31987 11.5 2.85896 10.4979 3.41496 9.84921L7.24074 5.3858Z"
      fill={fill}
      transform={direction === 'DOWN' ? `rotate(180, ${Number(width) / 2}, ${Number(height) / 2})` : ''}
    />
  </Svg>
);

export { DropArrow };
