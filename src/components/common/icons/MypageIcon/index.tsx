import React from 'react';
import Svg, { Circle, Path, SvgProps } from 'react-native-svg';

import { theme } from 'styles/theme';

const MypageIcon = ({
  width = 22,
  height = 22,
  fill = 'none',
  stroke = theme.COLORS.GRAY_SCALE.GRAY_600,
}: Pick<SvgProps, 'width' | 'height'> & { fill?: string; stroke?: string }) => {
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill={fill}>
      <Circle cx="10" cy="5" r="4.5" stroke={stroke} />
      <Path
        d="M19.1534 19.5347C11.5881 7.13256 4.40794 13.6666 0.816018 19.5613C0.424446 20.2039 0.903854 21.0001 1.65636 21.0001H18.3111C19.0712 21.0001 19.5492 20.1836 19.1534 19.5347Z"
        stroke={stroke}
      />
    </Svg>
  );
};

export { MypageIcon };
