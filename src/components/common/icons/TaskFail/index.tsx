import React from 'react';
import Svg, { Path, Rect, SvgProps } from 'react-native-svg';

import { theme } from 'styles/theme';

const TaskFail = ({ width = 24, height = 24 }: Pick<SvgProps, 'width' | 'height'>) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="2" width="20" height="20" rx="10" fill={theme.COLORS.GRAY_SCALE.GRAY_92} />
    <Path
      d="M13.5937 8.50354C14.0686 8.00255 14.8593 7.98103 15.3603 8.45569C15.8614 8.93058 15.8831 9.72219 15.4082 10.2233L13.7217 12.0016L15.4082 13.7809C15.8829 14.2818 15.8619 15.0726 15.3613 15.5475C14.8603 16.0223 14.0686 16.0016 13.5937 15.5006L12 13.819L10.4062 15.5006C9.93135 16.0016 9.13971 16.0223 8.63867 15.5475C8.13806 15.0726 8.11709 14.2818 8.59179 13.7809L10.2773 12.0016L8.59179 10.2233C8.1169 9.72219 8.13858 8.93058 8.63965 8.45569C9.14073 7.98103 9.93143 8.00255 10.4062 8.50354L12 10.1842L13.5937 8.50354Z"
      fill={theme.COLORS.GRAY_SCALE.GRAY_70}
    />
  </Svg>
);

export { TaskFail };
