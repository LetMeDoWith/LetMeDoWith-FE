import React from 'react';
import Svg, { Path, Circle, SvgProps } from 'react-native-svg';

import { theme } from 'styles/theme';

const NotificationOn = ({
  width = 24,
  height = 24,
  fill = theme.COLORS.PRIMARY.RED_60,
}: Pick<SvgProps, 'width' | 'height'> & { fill?: string }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M13.7305 19.75C13.3845 20.3473 12.7399 20.75 12 20.75C11.2601 20.75 10.6155 20.3473 10.2695 19.75H13.7305Z"
      fill={theme.COLORS.GRAY_SCALE.GRAY_40}
      stroke={theme.COLORS.GRAY_SCALE.GRAY_40}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <Circle cx="17" cy="4.25" r="2" fill={fill} />
    <Path
      d="M11.9999 2.75C12.7776 2.75 13.5236 2.88624 14.2148 3.13672C14.077 3.48108 13.9999 3.85644 13.9999 4.25C13.9999 5.90684 15.3431 7.24998 16.9999 7.25C17.3933 7.25 17.768 7.17182 18.1122 7.03418C18.363 7.72573 18.4999 8.47186 18.4999 9.25V13.8818L19.8661 16.25C20.0446 16.5593 20.0447 16.9407 19.8661 17.25C19.6875 17.5593 19.3571 17.75 18.9999 17.75H4.99994C4.64274 17.75 4.31238 17.5593 4.13373 17.25C3.95521 16.9407 3.95527 16.5593 4.13373 16.25L5.49994 13.8818V9.25C5.49994 5.66016 8.4101 2.75002 11.9999 2.75Z"
      fill={theme.COLORS.GRAY_SCALE.GRAY_40}
    />
  </Svg>
);

export { NotificationOn };
