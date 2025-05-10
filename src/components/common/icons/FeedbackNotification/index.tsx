import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

const FeedbackNotification = ({ width = 16, height = 16 }: Pick<SvgProps, 'width' | 'height'>) => (
  <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
    <Path
      d="M2.20227 7.35503C2.20227 4.15375 4.79742 1.55859 7.99871 1.55859C11.2 1.55859 13.7951 4.15375 13.7951 7.35503V11.8634H2.20227V7.35503Z"
      fill="#C9CBCF"
    />
    <Path
      d="M2.2035 11.8633H13.7964L14.6184 13.5074C14.8326 13.9356 14.5212 14.4395 14.0424 14.4395H1.9575C1.47872 14.4395 1.16733 13.9356 1.38144 13.5074L2.2035 11.8633Z"
      fill="#AEB0B6"
    />
  </Svg>
);

export { FeedbackNotification };
