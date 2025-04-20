import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

const Notification = ({ width = 24, height = 24 }: Pick<SvgProps, 'width' | 'height'>) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M5.5 9C5.5 5.41015 8.41015 2.5 12 2.5C15.5899 2.5 18.5 5.41015 18.5 9V13.6322L19.8662 16.0003C20.0447 16.3097 20.0446 16.6908 19.8659 17.0001C19.6873 17.3095 19.3572 17.5 19 17.5H5C4.64279 17.5 4.31271 17.3095 4.13405 17.0001C3.9554 16.6908 3.95531 16.3097 4.13381 16.0003L5.5 13.6322V9Z"
      fill="#61636B"
    />
    <Path
      d="M13.7324 19.5C13.3866 20.0978 12.7403 20.5 12 20.5C11.2597 20.5 10.6134 20.0978 10.2676 19.5H13.7324Z"
      fill="#61636B"
      stroke="#61636B"
      stroke-width="2"
      stroke-linejoin="round"
    />
  </Svg>
);

export { Notification };
