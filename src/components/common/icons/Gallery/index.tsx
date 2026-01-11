import React from 'react';
import Svg, { Path, Rect, SvgProps } from 'react-native-svg';

import { theme } from 'styles/theme';

const Gallery = ({ width = 24, height = 24 }: Pick<SvgProps, 'width' | 'height'>) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Rect width="24" height="24" rx="12" fill={theme.COLORS.GRAY_SCALE.GRAY_50} />
    <Path
      d="M6 8C6 7.46957 6.21071 6.96086 6.58579 6.58579C6.96086 6.21071 7.46957 6 8 6H16C16.5304 6 17.0391 6.21071 17.4142 6.58579C17.7893 6.96086 18 7.46957 18 8V16C18 16.5304 17.7893 17.0391 17.4142 17.4142C17.0391 17.7893 16.5304 18 16 18H8C7.46957 18 6.96086 17.7893 6.58579 17.4142C6.21071 17.0391 6 16.5304 6 16V8Z"
      stroke={theme.COLORS.GRAY_SCALE.GRAY_96}
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <Path
      d="M6 14.6666L9.33333 11.3332C9.952 10.7379 10.7147 10.7379 11.3333 11.3332L14.6667 14.6666"
      stroke={theme.COLORS.GRAY_SCALE.GRAY_96}
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <Path
      d="M13.332 13.3319L13.9987 12.6652C14.6174 12.0699 15.38 12.0699 15.9987 12.6652L17.9987 14.6653"
      stroke={theme.COLORS.GRAY_SCALE.GRAY_96}
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </Svg>
);
export { Gallery };
