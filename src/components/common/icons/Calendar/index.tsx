import React from 'react';
import Svg, { Rect, SvgProps } from 'react-native-svg';

const Calendar = ({ width = 16, height = 16 }: Pick<SvgProps, 'width' | 'height'>) => (
  <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
    <Rect x="1.59961" y="3.20312" width="12.8" height="11.2" rx="2.13333" fill="#E4E5E7" />
    <Rect x="4" y="1.60156" width="1.2" height="3.6" rx="0.6" fill="#94969E" />
    <Rect x="11.1992" y="1.60156" width="1.2" height="3.6" rx="0.6" fill="#94969E" />
  </Svg>
);

export { Calendar };
