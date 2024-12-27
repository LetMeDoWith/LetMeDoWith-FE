import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

const PlusIcon = ({
  width = 16,
  height = 16,
  fill = '#61636B',
}: Pick<SvgProps, 'width' | 'height'> & { fill?: string }) => (
  <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
    <Path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M9 3C9 2.44772 8.55228 2 8 2C7.44772 2 7 2.44772 7 3V6.75H3C2.44772 6.75 2 7.19772 2 7.75C2 8.30228 2.44772 8.75 3 8.75H7V13C7 13.5523 7.44772 14 8 14C8.55228 14 9 13.5523 9 13V8.75H13C13.5523 8.75 14 8.30228 14 7.75C14 7.19771 13.5523 6.75 13 6.75H9V3Z"
      fill={fill}
    />
  </Svg>
);

export { PlusIcon };
