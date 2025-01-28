import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

const TodoMode = ({ width = 60, height = 31 }: Pick<SvgProps, 'width' | 'height'>) => (
  <Svg width={width} height={height} viewBox="0 0 60 31" fill="none">
    <Path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M14.2484 3.78668C16.8343 1.71461 20.6104 2.13118 22.6825 4.71714L29.716 13.495L37.4632 4.54271C39.6316 2.03699 43.4208 1.76354 45.9265 3.93196C48.4322 6.10037 48.7056 9.88951 46.5372 12.3952L34.0757 26.7952C32.91 28.1422 31.2062 28.9016 29.4252 28.8679C27.6442 28.8342 25.9703 28.0109 24.8564 26.6208L13.3179 12.2208C11.2459 9.63484 11.6624 5.85876 14.2484 3.78668Z"
      fill="#29ADFF"
    />
  </Svg>
);

export { TodoMode };
