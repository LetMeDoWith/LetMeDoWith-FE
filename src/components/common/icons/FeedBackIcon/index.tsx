import Svg, { Path, SvgProps, Text } from 'react-native-svg';

import { theme, FONT_FAMILY } from 'styles/theme';
import { TASK_STATUS_ENUM } from 'schemes/task/enum';
import type { TaskStatusEnumType } from 'types/task/scheme/enum';

const FeedBackIcon = ({
  width = 24,
  height = 20,
  status = TASK_STATUS_ENUM.enum.FAIL,
  count = 0,
}: Pick<SvgProps, 'width' | 'height'> & { status: TaskStatusEnumType; count: number }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 20" fill="none">
      <Path
        d="M3 9C3 4.02944 7.02944 0 12 0C16.9706 0 21 4.02944 21 9V16H3V9Z"
        fill={status === TASK_STATUS_ENUM.enum.FAIL ? theme.COLORS.GRAY_SCALE.GRAY_70 : theme.COLORS.PRIMARY.RED_60}
      />
      <Text
        x="12"
        y="10"
        fontSize="10"
        fontFamily={FONT_FAMILY.BOLD}
        fill={theme.COLORS.DEFAULT.WHITE}
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        {count}
      </Text>
      <Path
        d="M3 16H21L21.9004 18.5528C22.2103 19.2177 21.7595 20 21.0664 20H2.93356C2.24046 20 1.78967 19.2177 2.09963 18.5528L3 16Z"
        fill="#797C86"
      />
    </Svg>
  );
};

export { FeedBackIcon };
