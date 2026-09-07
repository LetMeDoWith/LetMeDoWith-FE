import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

import { theme } from 'styles/theme';

/*
 * 2×2 격자 아이콘(카테고리). 원본은 칸마다 채움과 테두리가 같은 색으로 겹쳐 있어
 * path를 한 벌만 두고 fill·stroke에 같은 색을 준다.
 */
const LayoutGrid = ({
  width = 16,
  height = 16,
  fill = theme.COLORS.GRAY_SCALE.GRAY_80,
}: Pick<SvgProps, 'width' | 'height'> & { fill?: string }) => (
  <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
    <Path
      d="M6 2H2.66667C2.29848 2 2 2.29848 2 2.66667V6C2 6.36819 2.29848 6.66667 2.66667 6.66667H6C6.36819 6.66667 6.66667 6.36819 6.66667 6V2.66667C6.66667 2.29848 6.36819 2 6 2Z"
      fill={fill}
      stroke={fill}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.3333 2H10C9.63181 2 9.33333 2.29848 9.33333 2.66667V6C9.33333 6.36819 9.63181 6.66667 10 6.66667H13.3333C13.7015 6.66667 14 6.36819 14 6V2.66667C14 2.29848 13.7015 2 13.3333 2Z"
      fill={fill}
      stroke={fill}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.3333 9.33333H10C9.63181 9.33333 9.33333 9.63181 9.33333 10V13.3333C9.33333 13.7015 9.63181 14 10 14H13.3333C13.7015 14 14 13.7015 14 13.3333V10C14 9.63181 13.7015 9.33333 13.3333 9.33333Z"
      fill={fill}
      stroke={fill}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6 9.33333H2.66667C2.29848 9.33333 2 9.63181 2 10V13.3333C2 13.7015 2.29848 14 2.66667 14H6C6.36819 14 6.66667 13.7015 6.66667 13.3333V10C6.66667 9.63181 6.36819 9.33333 6 9.33333Z"
      fill={fill}
      stroke={fill}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export { LayoutGrid };
