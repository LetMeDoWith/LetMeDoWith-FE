import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

import { theme } from 'styles/theme';

/* 워드마크·체크에 쓰는 짙은 색. theme 토큰에 없는 값이라 여기서만 쓴다. */
const CHECK_DARK = '#0D0D0D';

/* 오른쪽 체크의 경로. 흰 테두리와 채우기로 두 번 그린다. */
const RIGHT_CHECK_PATH =
  'M16.1309 5.52246C16.7818 4.87156 17.8374 4.87156 18.4883 5.52246C19.139 6.1733 19.139 7.22803 18.4883 7.87891L12.0537 14.3145C11.3117 15.0565 10.1082 15.0564 9.36621 14.3145L6.23145 11.1797C5.58055 10.5288 5.58055 9.47316 6.23145 8.82227C6.88229 8.17153 7.93701 8.1716 8.58789 8.82227L10.709 10.9434L16.1309 5.52246Z';

/*
 * 오른쪽 체크 둘레에 덧대는 흰 테두리 두께.
 *
 * 원본 SVG에도 두 체크 사이에 틈이 있지만 폭이 0.4 단위뿐이라, 20x20으로 그리면
 * 0.4px가 되어 안티에일리어싱에 묻힌다. 색이 다를 땐 대비로 구분되지만 두 모드가
 * 같은 상태여서 색까지 같아지면 한 덩어리로 보인다. 원본 틈에 이만큼을 보태 살린다.
 */
const GAP_WIDTH = 1.5;

/*
 * 두윗과 투두가 모두 등록된 날에 쓰는 겹친 체크.
 * 왼쪽·오른쪽 색을 따로 받아 각 모드의 상태를 나타낸다.
 */
const DoubleCalendarCheck = ({
  width = 20,
  height = 20,
  leftFill = CHECK_DARK,
  rightFill = theme.COLORS.PRIMARY.RED_60,
}: Pick<SvgProps, 'width' | 'height'> & { leftFill?: string; rightFill?: string }) => (
  <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
    <Path
      d="M3.51406 9.17578C3.05843 8.72015 2.3197 8.72015 1.86406 9.17578C1.40843 9.63142 1.40843 10.3701 1.86406 10.8258L4.99906 13.9608C5.54582 14.5075 6.4323 14.5075 6.97906 13.9608L13.4141 7.52578C13.8697 7.07015 13.8697 6.33142 13.4141 5.87578C12.9584 5.42015 12.2197 5.42015 11.7641 5.87578L5.98906 11.6508L3.51406 9.17578Z"
      fill={leftFill}
    />
    {/* 흰 테두리를 먼저 깔고 그 위를 채운다. 테두리의 바깥 절반만 남아 왼쪽 체크와의 틈이 된다. */}
    <Path d={RIGHT_CHECK_PATH} stroke={theme.COLORS.DEFAULT.WHITE} strokeWidth={GAP_WIDTH} />
    <Path d={RIGHT_CHECK_PATH} fill={rightFill} />
  </Svg>
);

export { DoubleCalendarCheck, CHECK_DARK };
