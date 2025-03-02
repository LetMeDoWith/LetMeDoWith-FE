import React from 'react';
import Svg, { Path, Rect, SvgProps } from 'react-native-svg';

const ExclamationMarkCircle = ({
  width = 16,
  height = 16,
  fill = '#C9CBCF',
}: Pick<SvgProps, 'width' | 'height'> & { fill?: string }) => (
  <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
    <Rect x="1" y="1" width="14" height="14" rx="7" fill={fill} />
    <Path
      d="M8.73527 9.44892H7.26647V5.47452C7.26647 5.00652 7.61927 4.76172 8.00087 4.76172C8.37527 4.76172 8.73527 5.01372 8.73527 5.47452V9.44892ZM7.23047 10.5145C7.23047 10.0681 7.51847 9.78732 8.00087 9.78732C8.48327 9.78732 8.77127 10.0753 8.77127 10.5145C8.77127 10.9537 8.48327 11.2417 8.00087 11.2417C7.51847 11.2417 7.23047 10.9609 7.23047 10.5145Z"
      fill="white"
    />
  </Svg>
);

export { ExclamationMarkCircle };
