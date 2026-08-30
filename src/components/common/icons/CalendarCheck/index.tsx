import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

import { theme } from 'styles/theme';

/* 달력 날짜 아래 표시하는 체크. 색으로 해당 날짜 태스크의 상태를 나타낸다. */
const CalendarCheck = ({
  width = 20,
  height = 20,
  fill = theme.COLORS.GRAY_SCALE.GRAY_80,
}: Pick<SvgProps, 'width' | 'height'> & { fill?: string }) => (
  <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
    <Path
      d="M6.30703 9.125C5.8514 8.66937 5.11267 8.66936 4.65703 9.125C4.2014 9.58064 4.2014 10.3194 4.65703 10.775L7.79203 13.91C8.33879 14.4568 9.22527 14.4568 9.77203 13.91L16.207 7.475C16.6627 7.01936 16.6627 6.28063 16.207 5.825C15.7514 5.36937 15.0127 5.36936 14.557 5.825L8.78203 11.6L6.30703 9.125Z"
      fill={fill}
    />
  </Svg>
);

export { CalendarCheck };
