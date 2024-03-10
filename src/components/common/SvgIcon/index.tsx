import React from 'react';
import { SvgProps } from 'react-native-svg';

import * as Icons from '@assets/icons';

interface IconProps extends SvgProps {
  // re-export 되는 SVG 파일들의 이름을 name 으로 받음
  name: keyof typeof Icons;
  // width, height를 동시에 주고 싶을 때 사용
  size?: number;
}

const SvgIcon = ({
  name,
  fill = 'none',
  stroke = '#AEB6BE',
  width: _width,
  height: _height,
  size,
  ...props
}: IconProps) => {
  const Component = Icons[name];
  const width = _width ?? size;
  const height = _height ?? size;

  const sizeProps = {
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
  };

  return <Component {...props} fill={fill} stroke={stroke} {...sizeProps} />;
};

export default SvgIcon;
