import React from 'react';
import Svg, { Circle, SvgProps } from 'react-native-svg';

import { theme } from 'styles/theme';

interface Props {
  disabled?: boolean;
}

const EtcDots = ({ width = 16, height = 16, disabled = false }: Pick<SvgProps, 'width' | 'height'> & Props) => (
  <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
    <Circle
      cx="3.25"
      cy="8"
      r="1.25"
      fill={disabled ? theme.COLORS.GRAY_SCALE.GRAY_92 : theme.COLORS.GRAY_SCALE.GRAY_70}
    />
    <Circle
      cx="8"
      cy="8"
      r="1.25"
      fill={disabled ? theme.COLORS.GRAY_SCALE.GRAY_92 : theme.COLORS.GRAY_SCALE.GRAY_70}
    />
    <Circle
      cx="12.75"
      cy="8"
      r="1.25"
      fill={disabled ? theme.COLORS.GRAY_SCALE.GRAY_92 : theme.COLORS.GRAY_SCALE.GRAY_70}
    />
  </Svg>
);

export { EtcDots };
