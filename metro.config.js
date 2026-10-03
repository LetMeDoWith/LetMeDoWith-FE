const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withSentryConfig } = require('@sentry/react-native/metro');
const { isDevtoolsBuild } = require('./scripts/isDevtoolsBuild');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  /*
   * babel.config.js는 ENABLE_DEVTOOLS에 따라 console 제거 여부가 달라지는데, Metro 변환 캐시 키에는 .env가 없다.
   * 같은 머신에서 dev 빌드 후 운영 빌드를 하면 console이 남은 캐시를 재사용할 수 있어 캐시를 분리한다.
   */
  cacheVersion: isDevtoolsBuild() ? 'devtools' : 'production',
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  },
};

/* 번들에 debug ID를 심어 업로드된 소스맵과 정확히 짝지어 준다 */
module.exports = withSentryConfig(mergeConfig(defaultConfig, config));
