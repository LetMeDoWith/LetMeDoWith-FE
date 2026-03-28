import React from 'react';
import Svg, { Defs, LinearGradient, Path, Stop, SvgProps } from 'react-native-svg';

const DoubleThunder = ({ width = 48, height = 48 }: Pick<SvgProps, 'width' | 'height'>) => (
  <Svg width={width} height={height} viewBox="0 0 48 48" fill="none">
    <Path
      d="M18.4369 4.61375C19.1569 3.49518 20.892 4.00602 20.892 5.33641V19.4497H25.4759C26.4994 19.4501 27.14 20.5551 26.6322 21.4438L14.2631 43.0903C13.5845 44.2768 11.7728 43.7953 11.7728 42.4282V25.6684H7.33532C6.28023 25.6684 5.64338 24.5011 6.21423 23.6138L18.4369 4.61375Z"
      fill="url(#paint0_linear_20054_95892)"
    />
    <Path
      d="M39.2605 21.2241C40.3944 20.5284 41.7363 21.7411 41.1594 22.9399L37.0797 31.4175L39.6457 32.6524C40.5677 33.0965 40.6656 34.37 39.8228 34.9506L25.9908 44.479C24.8649 45.2544 23.4394 44.0352 24.0314 42.8035L28.9165 32.6521L26.4826 31.4808C25.532 31.0233 25.4646 29.6954 26.3633 29.1432L39.2605 21.2241Z"
      fill="url(#paint1_linear_20054_95892)"
    />
    <Defs>
      <LinearGradient
        id="paint0_linear_20054_95892"
        x1="39.4375"
        y1="36.1662"
        x2="25.8868"
        y2="29.6451"
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#FF6333" />
        <Stop offset="1" stopColor="#FF8D6A" />
      </LinearGradient>
      <LinearGradient
        id="paint1_linear_20054_95892"
        x1="39.4375"
        y1="36.1662"
        x2="25.8868"
        y2="29.6451"
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#FF6333" />
        <Stop offset="1" stopColor="#FF8D6A" />
      </LinearGradient>
    </Defs>
  </Svg>
);

export { DoubleThunder };
