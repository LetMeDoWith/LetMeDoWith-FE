import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

import { theme } from 'styles/theme';
import { TASK_STATUS } from 'constants/Task';

type TaskStatus = keyof typeof TASK_STATUS;

const getMarkPathColor = (status: TaskStatus) => {
  switch (status) {
    case 'TODO_SUCCESS':
      return {
        left: theme.COLORS.SECONDARY.BLUE_60,
        right: theme.COLORS.SECONDARY.BLUE_60,
        center: theme.COLORS.SECONDARY.BLUE_60,
        shadow: theme.COLORS.SECONDARY.BLUE_60,
      };
    case 'ONLY_TODO_SUCCESS':
      return {
        left: theme.COLORS.GRAY_SCALE.GRAY_92,
        right: theme.COLORS.SECONDARY.BLUE_60,
        center: theme.COLORS.SECONDARY.BLUE_60,
        shadow: theme.COLORS.DEFAULT.BLACK,
      };
    case 'DOWITH_SUCCESS':
      return {
        left: theme.COLORS.PRIMARY.RED_60,
        right: theme.COLORS.PRIMARY.RED_60,
        center: theme.COLORS.PRIMARY.RED_60,
        shadow: theme.COLORS.PRIMARY.RED_60,
      };
    case 'ONLY_DOWITH_SUCCESS':
      return {
        left: theme.COLORS.PRIMARY.RED_60,
        right: theme.COLORS.GRAY_SCALE.GRAY_92,
        center: theme.COLORS.PRIMARY.RED_60,
        shadow: theme.COLORS.DEFAULT.BLACK,
      };
    case 'ALL_SUCCESS':
      return {
        left: theme.COLORS.PRIMARY.RED_60,
        right: theme.COLORS.SECONDARY.BLUE_60,
        center: theme.COLORS.PRIMARY.RED_60,
        shadow: theme.COLORS.DEFAULT.BLACK,
      };
    default:
      return {
        left: theme.COLORS.GRAY_SCALE.GRAY_92,
        right: theme.COLORS.GRAY_SCALE.GRAY_92,
        center: theme.COLORS.GRAY_SCALE.GRAY_92,
        shadow: theme.COLORS.GRAY_SCALE.GRAY_92,
      };
  }
};

const TaskStatusMarking = ({
  width = 18,
  height = 18,
  status,
}: Pick<SvgProps, 'width' | 'height'> & { status: TaskStatus }) => (
  <Svg width={width} height={height} viewBox="0 0 18 18" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.3166 5.01545C14.4054 4.10423 12.928 4.10423 12.0168 5.01545L7.35008 9.68212C6.43886 10.5933 6.43886 12.0707 7.35008 12.9819C8.26131 13.8932 9.73869 13.8932 10.6499 12.9819L15.3166 8.31528C16.2278 7.40406 16.2278 5.92667 15.3166 5.01545Z"
      fill={getMarkPathColor(status).right}
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.68342 5.01545C3.59464 4.10423 5.07203 4.10423 5.98325 5.01545L10.6499 9.68212C11.5611 10.5933 11.5611 12.0707 10.6499 12.9819C9.73869 13.8932 8.26131 13.8932 7.35008 12.9819L2.68342 8.31528C1.77219 7.40406 1.77219 5.92667 2.68342 5.01545Z"
      fill={getMarkPathColor(status).left}
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.6495 9.68507L8.99959 8.03516L7.34968 9.68507C6.43845 10.5963 6.43845 12.0737 7.34968 12.9849C7.46358 13.0988 7.58633 13.1985 7.71571 13.2839C8.6214 13.8819 9.85219 13.7822 10.6495 12.9849C11.5607 12.0737 11.5607 10.5963 10.6495 9.68507Z"
      fill={getMarkPathColor(status).center}
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.6495 9.68507L8.99959 8.03516L7.34968 9.68507C6.43845 10.5963 6.43845 12.0737 7.34968 12.9849C7.46358 13.0988 7.58633 13.1985 7.71571 13.2839C8.6214 13.8819 9.85219 13.7822 10.6495 12.9849C11.5607 12.0737 11.5607 10.5963 10.6495 9.68507Z"
      fill={getMarkPathColor(status).shadow}
      fillOpacity="0.2"
    />
  </Svg>
);

export { TaskStatusMarking };
