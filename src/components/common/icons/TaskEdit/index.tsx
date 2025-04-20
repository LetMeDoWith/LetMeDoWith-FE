import React from 'react';
import Svg, { Path, Rect, SvgProps } from 'react-native-svg';

const TaskEdit = ({ width = 25, height = 25 }: Pick<SvgProps, 'width' | 'height'>) => (
  <Svg width={width} height={height} viewBox="0 0 25 25" fill="none">
    <Rect x="0.164062" y="0.5" width="24" height="24" rx="12" fill="#FFF7CC" />
    <Path
      d="M7.16406 17.5V14.6429L14.3069 7.5L17.1641 10.3571L10.0212 17.5H7.16406Z"
      stroke="#FFD91A"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <Path
      d="M12.1641 9.64453L15.0212 12.5017"
      stroke="#FFD91A"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </Svg>
);

export { TaskEdit };
