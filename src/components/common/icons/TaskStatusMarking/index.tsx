import React from 'react';
import Svg, { Defs, LinearGradient, Path, Rect, Stop, SvgProps } from 'react-native-svg';

import { theme } from 'styles/theme';
import { TASK_STATUS } from 'constants/Task';

type TaskStatus = keyof typeof TASK_STATUS;

const getMarkFillColor = (status: TaskStatus) => {
  switch (status) {
    case 'TODO_WAIT':
      return {
        left: 'none',
        right: 'none',
        backgroundLeft: theme.COLORS.SECONDARY.BLUE_95,
        backgroundRight: theme.COLORS.SECONDARY.BLUE_95,
      };
    case 'TODO_FAIL':
    case 'TODO_SOME_SUCCESS':
      return {
        left: theme.COLORS.GRAY_SCALE.GRAY_80,
        right: theme.COLORS.GRAY_SCALE.GRAY_80,
        backgroundLeft: theme.COLORS.SECONDARY.BLUE_95,
        backgroundRight: theme.COLORS.SECONDARY.BLUE_95,
      };
    case 'TODO_SUCCESS':
      return {
        left: theme.COLORS.SECONDARY.BLUE_60,
        right: theme.COLORS.SECONDARY.BLUE_60,
        backgroundLeft: theme.COLORS.SECONDARY.BLUE_95,
        backgroundRight: theme.COLORS.SECONDARY.BLUE_95,
      };
    case 'DOWITH_WAIT':
      return {
        left: 'none',
        right: 'none',
        backgroundLeft: theme.COLORS.PRIMARY.RED_98,
        backgroundRight: theme.COLORS.PRIMARY.RED_98,
      };
    case 'DOWITH_FAIL':
    case 'DOWITH_SOME_SUCCESS':
      return {
        left: theme.COLORS.GRAY_SCALE.GRAY_80,
        right: theme.COLORS.GRAY_SCALE.GRAY_80,
        backgroundLeft: theme.COLORS.PRIMARY.RED_98,
        backgroundRight: theme.COLORS.PRIMARY.RED_98,
      };
    case 'DOWITH_SUCCESS':
      return {
        left: theme.COLORS.PRIMARY.RED_60,
        right: theme.COLORS.PRIMARY.RED_60,
        backgroundLeft: theme.COLORS.PRIMARY.RED_98,
        backgroundRight: theme.COLORS.PRIMARY.RED_98,
      };
    case 'ALL_WAIT':
      return {
        left: 'none',
        right: 'none',
        backgroundLeft: theme.COLORS.PRIMARY.RED_98,
        backgroundRight: theme.COLORS.SECONDARY.BLUE_95,
      };
    case 'ALL_FAIL':
    case 'ALL_SOME_SUCCESS':
      return {
        left: theme.COLORS.GRAY_SCALE.GRAY_80,
        right: theme.COLORS.GRAY_SCALE.GRAY_80,
        backgroundLeft: theme.COLORS.PRIMARY.RED_98,
        backgroundRight: theme.COLORS.SECONDARY.BLUE_95,
      };
    case 'ALL_SUCCESS':
      return {
        left: theme.COLORS.PRIMARY.RED_60,
        right: theme.COLORS.SECONDARY.BLUE_60,
        backgroundLeft: theme.COLORS.PRIMARY.RED_98,
        backgroundRight: theme.COLORS.SECONDARY.BLUE_95,
      };
    default:
      return {
        left: 'none',
        right: 'none',
        backgroundLeft: 'none',
        backgroundRight: 'none',
      };
  }
};

const TaskStatusMarking = ({
  width = 20,
  height = 21,
  status,
}: Pick<SvgProps, 'width' | 'height'> & { status: TaskStatus }) => (
  <Svg width={width} height={height} viewBox="0 0 20 21" fill="none">
    <Rect y="0.75" width="20" height="20" rx="8" fill="url(#paint0_linear_17417_94418)" />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.0748 7.54917C14.3426 6.81694 13.1554 6.81694 12.4232 7.54917L8.6732 11.2992C7.94097 12.0314 7.94097 13.2186 8.6732 13.9508C9.40543 14.6831 10.5926 14.6831 11.3248 13.9508L15.0748 10.2008C15.8071 9.46859 15.8071 8.28141 15.0748 7.54917Z"
      fill={getMarkFillColor(status).right}
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.92417 7.54917C5.65641 6.81694 6.84359 6.81694 7.57583 7.54917L11.3258 11.2992C12.0581 12.0314 12.0581 13.2186 11.3258 13.9508C10.5936 14.6831 9.40641 14.6831 8.67417 13.9508L4.92417 10.2008C4.19194 9.46859 4.19194 8.28141 4.92417 7.54917Z"
      fill={getMarkFillColor(status).left}
    />
    <Defs>
      <LinearGradient
        id="paint0_linear_17417_94418"
        x1="2.5"
        y1="2.75"
        x2="17.5"
        y2="19.25"
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor={getMarkFillColor(status).backgroundLeft} />
        <Stop offset="1" stopColor={getMarkFillColor(status).backgroundRight} />
      </LinearGradient>
    </Defs>
  </Svg>
);

export { TaskStatusMarking };
