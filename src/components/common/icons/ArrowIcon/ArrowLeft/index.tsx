import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

const ArrowLeft = ({
  width = 16,
  height = 16,
  fill = '#61636B',
}: Pick<SvgProps, 'width' | 'height'> & { fill?: string }) => (
  <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
    <Path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M11.2071 13.7071C10.8166 14.0976 10.1834 14.0976 9.79289 13.7071L4.79289 8.70711C4.40237 8.31658 4.40237 7.68342 4.79289 7.29289L9.79289 2.29289C10.1834 1.90237 10.8166 1.90237 11.2071 2.29289C11.5976 2.68342 11.5976 3.31658 11.2071 3.70711L6.91421 8L11.2071 12.2929C11.5976 12.6834 11.5976 13.3166 11.2071 13.7071Z"
      fill={fill}
    />
  </Svg>
);

export { ArrowLeft };
