import React from 'react';
import Svg, { Rect, SvgProps } from 'react-native-svg';

import type { TaskModeType } from 'types/shared';
import { theme } from 'styles/theme';

interface Props {
  mode: TaskModeType;
}

const TaskWait = ({ width = 24, height = 24, mode }: Pick<SvgProps, 'width' | 'height'> & Props) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Rect
      x="2.5"
      y="2.5"
      width="19"
      height="19"
      rx="9.5"
      stroke={mode === 'DOWITH' ? theme.COLORS.PRIMARY.RED_60 : theme.COLORS.SECONDARY.BLUE_60}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeDasharray="1 4"
    />
  </Svg>
);

export { TaskWait };
