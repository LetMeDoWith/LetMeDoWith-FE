import React from 'react';
import Svg, { Path, Rect, SvgProps } from 'react-native-svg';

import { theme } from 'styles/theme';

const TaskFail = ({ width = 20, height = 20 }: Pick<SvgProps, 'width' | 'height'>) => (
  <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
    <Rect width="20" height="20" rx="10" fill={theme.COLORS.GRAY_SCALE.GRAY_92} />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.5937 6.49951C12.0686 5.99844 12.8598 5.97722 13.3608 6.45211C13.8619 6.927 13.8831 7.71817 13.4082 8.21924L11.7222 9.99823L13.4083 11.7772C13.8831 12.2783 13.8619 13.0695 13.3608 13.5444C12.8598 14.0192 12.0686 13.998 11.5937 13.497L10 11.8154L8.40629 13.497C7.9314 13.998 7.14023 14.0192 6.63916 13.5444C6.13809 13.0695 6.11687 12.2783 6.59176 11.7772L8.2778 9.99823L6.59176 8.21924C6.11687 7.71817 6.1381 6.927 6.63917 6.45211C7.14024 5.97722 7.93141 5.99844 8.4063 6.49951L10 8.18108L11.5937 6.49951Z"
      fill={theme.COLORS.GRAY_SCALE.GRAY_70}
    />
  </Svg>
);

export { TaskFail };
