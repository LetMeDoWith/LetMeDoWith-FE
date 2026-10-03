const { isDevtoolsBuild } = require('./scripts/isDevtoolsBuild');

/*
 * 운영 빌드(ENABLE_DEVTOOLS가 true가 아닌 릴리즈 번들)에서는 console.error만 남기고 나머지 console을 지운다.
 * - dev 배포 빌드(ENABLE_DEVTOOLS=true)는 개발자도구 Console 탭이 console 호출을 가로채 보여주므로 유지한다.
 * - console.error는 운영 기기에서 adb logcat·콘솔 앱으로 볼 수 있는 마지막 단서라 남긴다.
 * - env.production은 Metro 개발 빌드·jest에는 적용되지 않는다.
 * Metro 변환 캐시가 이 분기를 모르므로 metro.config.js의 cacheVersion으로 두 빌드의 캐시를 분리한다.
 */
const productionPlugins = ['react-native-paper/babel'];
if (!isDevtoolsBuild()) {
  productionPlugins.push(['transform-remove-console', { exclude: ['error'] }]);
}

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  env: {
    production: {
      plugins: productionPlugins,
    },
  },
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          assets: './src/assets',
          components: './src/components',
          hooks: './src/hooks',
          screens: './src/screens',
          services: './src/services',
          stores: './src/stores',
          styles: './src/styles',
          types: './src/types',
          utils: './src/utils',
          constants: './src/constants',
          schemes: './src/schemes',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
