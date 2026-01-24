import React from 'react';
import Svg, { Path, Rect, SvgProps } from 'react-native-svg';

import type { TaskModeType } from 'types/shared';
import { theme } from 'styles/theme';

interface Props {
  mode: TaskModeType;
}

const TaskSuccess = ({ width = 24, height = 24, mode }: Pick<SvgProps, 'width' | 'height'> & Props) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Rect
      x="2.5"
      y="2.5"
      width="19"
      height="19"
      rx="9.5"
      fill={mode === 'DOWITH' ? theme.COLORS.PRIMARY.RED_60 : theme.COLORS.SECONDARY.BLUE_60}
    />
    <Rect
      x="2.5"
      y="2.5"
      width="19"
      height="19"
      rx="9.5"
      stroke={mode === 'DOWITH' ? theme.COLORS.PRIMARY.RED_60 : theme.COLORS.SECONDARY.BLUE_60}
    />
    <Path
      d="M9.5 10.5L11.9588 13.5L14.5 10.5"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export { TaskSuccess };
