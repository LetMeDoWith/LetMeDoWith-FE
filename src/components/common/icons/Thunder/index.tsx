import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

import { theme } from 'styles/theme';

const Thunder = ({
  width = 16,
  height = 16,
  fill = theme.COLORS.GRAY_SCALE.GRAY_40,
}: Pick<SvgProps, 'width' | 'height'> & { fill?: string }) => (
  <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
    <Path
      d="M8.37268 1.52441C8.7665 1.03304 9.5592 1.31144 9.5592 1.94141V5.95605H13.0533C13.6123 5.95605 13.9231 6.60255 13.5739 7.03906L7.62756 14.4717C7.23382 14.9634 6.44104 14.6848 6.44104 14.0547V10.041H2.9469C2.3879 10.041 2.07718 9.39452 2.42639 8.95801L8.37268 1.52441Z"
      fill={fill}
    />
  </Svg>
);

export { Thunder };
