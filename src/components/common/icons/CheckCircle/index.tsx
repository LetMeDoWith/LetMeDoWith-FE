import React from 'react';
import Svg, { Circle, G, Path, SvgProps } from 'react-native-svg';

import { theme } from 'styles/theme';

/*
 * 체크가 찍힌 원. TaskCheckedCircle과 달리 테두리가 물결이 아닌 기본 원이다.
 * 체크 모양은 TaskCheckedCircle과 같은 path를 쓰고, 원만 뷰박스를 꽉 채운다.
 */
const CheckCircle = ({
  width = 32,
  height = 32,
  fill = theme.COLORS.GRAY_SCALE.GRAY_20,
}: Pick<SvgProps, 'width' | 'height'> & { fill?: string }) => (
  <Svg width={width} height={height} viewBox="0 0 25 25" fill="none">
    <Circle cx="12.5" cy="12.5" r="12.5" fill={fill} />
    {/* 체크 path는 원래 더 작은 원(r 9.5)에 맞춰 그려져 있어, 원 중심 기준으로 키운다 */}
    <G transform="translate(12.5 12.5) scale(1.3) translate(-12.5 -12.5)">
      <Path
        d="M9.04135 11.8128C8.67007 11.4528 8.07993 11.4528 7.70865 11.8128C7.32085 12.1889 7.32085 12.8111 7.70865 13.1872L11.125 16.5L17.2914 10.5205C17.6792 10.1445 17.6792 9.52221 17.2914 9.14616C16.9201 8.78612 16.3299 8.78612 15.9586 9.14616L11.125 13.8333L9.04135 11.8128Z"
        fill={theme.COLORS.DEFAULT.WHITE}
      />
    </G>
  </Svg>
);

export { CheckCircle };
