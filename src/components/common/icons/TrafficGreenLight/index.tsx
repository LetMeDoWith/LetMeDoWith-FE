import React from 'react';
import Svg, { Circle, Rect, SvgProps } from 'react-native-svg';

const TrafficGreenLight = ({ width = 44, height = 18 }: Pick<SvgProps, 'width' | 'height'>) => (
  <Svg width={width} height={height} viewBox="0 0 44 18" fill="none">
    <Rect width="44" height="18" rx="9" fill="#313235" />
    <Circle cx="9" cy="9" r="5" fill="#CAF425" />
    <Circle cx="22" cy="9" r="5" fill="#665500" />
    <Circle cx="35" cy="9" r="5" fill="#630303" />
  </Svg>
);

export { TrafficGreenLight };
