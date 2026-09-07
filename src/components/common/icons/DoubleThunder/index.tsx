import React from 'react';
import Svg, { Defs, LinearGradient, Path, Stop, SvgProps } from 'react-native-svg';

const DoubleThunder = ({ width = 24, height = 24 }: Pick<SvgProps, 'width' | 'height'>) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8.77601 2.36532C9.13608 1.80632 10.0026 2.06154 10.0026 2.72665V9.78329H12.2946C12.8064 9.78329 13.1275 10.3359 12.8737 10.7804L6.68909 21.6036C6.34988 22.1971 5.443 21.9562 5.443 21.2725V12.8927H3.22425C2.69689 12.8924 2.37833 12.3089 2.6637 11.8653L8.77601 2.36532Z"
      fill="url(#paint0_linear_21968_44349)"
    />
    <Path
      d="M20.5144 11.1069C21.1271 10.8486 21.6992 11.5489 21.3238 12.098L18.669 15.9813L19.8444 16.7849C20.2667 17.0739 20.2187 17.7116 19.7584 17.9351L12.2038 21.6036C11.589 21.9019 10.9764 21.1913 11.362 20.6271L14.541 15.977L13.426 15.2148C12.9906 14.9171 13.0571 14.2555 13.5431 14.0504L20.5144 11.1069Z"
      fill="url(#paint1_linear_21968_44349)"
    />
    <Defs>
      <LinearGradient
        id="paint0_linear_21968_44349"
        x1="6.80492"
        y1="22.42"
        x2="19.3293"
        y2="-1.52816"
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#0B0B0B" />
        <Stop offset="1" stopColor="#FF6333" />
      </LinearGradient>
      <LinearGradient
        id="paint1_linear_21968_44349"
        x1="6.80492"
        y1="22.42"
        x2="19.3293"
        y2="-1.52816"
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#0B0B0B" />
        <Stop offset="1" stopColor="#FF6333" />
      </LinearGradient>
    </Defs>
  </Svg>
);

export { DoubleThunder };
