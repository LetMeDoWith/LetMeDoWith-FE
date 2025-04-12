import React from 'react';
import Svg, { Path, Rect, SvgProps } from 'react-native-svg';

const TaskDelete = ({ width = 25, height = 25 }: Pick<SvgProps, 'width' | 'height'>) => (
  <Svg width={width} height={height} viewBox="0 0 25 25" fill="none">
    <Rect x="0.164062" y="0.5" width="24" height="24" rx="12" fill="#FFE0D6" />
    <Path
      d="M8.66406 8.5V17.5C8.66406 18.0523 9.11178 18.5 9.66406 18.5H14.6641C15.2163 18.5 15.6641 18.0523 15.6641 17.5V8.5"
      stroke="#FF6333"
      stroke-width="1.5"
      stroke-linejoin="round"
    />
    <Path d="M7.16406 8.5H17.1641" stroke="#FF6333" stroke-width="1.5" stroke-linecap="round" />
    <Path d="M9.66406 6.5L14.6641 6.5" stroke="#FF6333" stroke-width="1.5" stroke-linecap="round" />
  </Svg>
);

export { TaskDelete };
