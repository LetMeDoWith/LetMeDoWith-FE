import React from 'react';
import Svg, { Circle, Rect, SvgProps } from 'react-native-svg';

const BlueCamera = ({ width = 24, height = 24 }: Pick<SvgProps, 'width' | 'height'>) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Rect x="5.1582" y="3.57812" width="13.6842" height="14.7368" rx="2" fill="#C4EBFF" />
    <Rect x="2" y="5.68359" width="20" height="14.7368" rx="2" fill="#C4EBFF" />
    <Circle cx="11.9996" cy="13.0504" r="4.21053" fill="#6DC4E3" />
    <Circle cx="11.9998" cy="13.0506" r="2.10526" fill="#E5F6FF" />
  </Svg>
);
export { BlueCamera };
