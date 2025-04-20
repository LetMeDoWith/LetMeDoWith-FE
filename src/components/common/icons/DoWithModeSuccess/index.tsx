import React from 'react';
import Svg, { Path, Rect, SvgProps } from 'react-native-svg';

import type { TaskModeType } from 'types/shared';
import { theme } from 'styles/theme';

interface Props {
  mode: TaskModeType;
}

const TaskSuccess = ({ width = 20, height = 21, mode }: Pick<SvgProps, 'width' | 'height'> & Props) => (
  <Svg width={width} height={height} viewBox="0 0 20 21" fill="none">
    <Rect
      x="0.5"
      y="1"
      width="19"
      height="19"
      rx="9.5"
      fill={mode === 'DOWITH' ? theme.COLORS.PRIMARY.RED_60 : theme.COLORS.SECONDARY.BLUE_60}
    />
    <Rect
      x="0.5"
      y="1"
      width="19"
      height="19"
      rx="9.5"
      stroke={mode === 'DOWITH' ? theme.COLORS.PRIMARY.RED_60 : theme.COLORS.SECONDARY.BLUE_60}
    />
    <Path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M6.66749 8.16915C7.18246 7.70936 7.97265 7.75409 8.43243 8.26906L10 10.0247L11.5676 8.26906C12.0274 7.75409 12.8176 7.70936 13.3325 8.16915C13.8475 8.62894 13.8922 9.41913 13.4324 9.93409L10.9324 12.7341C10.6953 12.9997 10.3561 13.1516 10 13.1516C9.64393 13.1516 9.30475 12.9997 9.06759 12.7341L6.56759 9.93409C6.1078 9.41913 6.15253 8.62894 6.66749 8.16915Z"
      fill="white"
    />
  </Svg>
);

export { TaskSuccess };
