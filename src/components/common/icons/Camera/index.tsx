import React from 'react';
import Svg, { Path, Rect, SvgProps } from 'react-native-svg';

import { theme } from 'styles/theme';

const Camera = ({ width = 24, height = 24 }: Pick<SvgProps, 'width' | 'height'>) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Rect width="24" height="24" rx="12" fill={theme.COLORS.GRAY_SCALE.GRAY_50} />
    <Path
      d="M6 16.2857V9.14286C6 8.95342 6.07902 8.77174 6.21967 8.63778C6.36032 8.50383 6.55109 8.42857 6.75 8.42857H7.875L9.15525 7.20929C9.29587 7.07532 9.4866 7.00004 9.6855 7H14.3145C14.5134 7.00004 14.7041 7.07532 14.8448 7.20929L16.125 8.42857H17.25C17.4489 8.42857 17.6397 8.50383 17.7803 8.63778C17.921 8.77174 18 8.95342 18 9.14286V16.2857C18 16.4752 17.921 16.6568 17.7803 16.7908C17.6397 16.9247 17.4489 17 17.25 17H6.75C6.55109 17 6.36032 16.9247 6.21967 16.7908C6.07902 16.6568 6 16.4752 6 16.2857Z"
      stroke={theme.COLORS.GRAY_SCALE.GRAY_96}
      stroke-width="1.5"
      stroke-linejoin="round"
    />
    <Path
      d="M14 12C14 12.5304 13.7893 13.0391 13.4142 13.4142C13.0391 13.7893 12.5304 14 12 14C11.4696 14 10.9609 13.7893 10.5858 13.4142C10.2107 13.0391 10 12.5304 10 12C10 11.4696 10.2107 10.9609 10.5858 10.5858C10.9609 10.2107 11.4696 10 12 10C12.5304 10 13.0391 10.2107 13.4142 10.5858C13.7893 10.9609 14 11.4696 14 12Z"
      stroke={theme.COLORS.GRAY_SCALE.GRAY_96}
      stroke-width="1.5"
      stroke-linejoin="round"
    />
  </Svg>
);
export { Camera };
