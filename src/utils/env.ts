import Config from 'react-native-config';

/**
 * 개발 모드 여부.
 * - Metro 디버그 빌드(__DEV__)
 * - 또는 ENABLE_DEVTOOLS=true로 빌드한 dev 빌드
 */
const IS_DEV_MODE = __DEV__ || Config.ENABLE_DEVTOOLS === 'true';

export { IS_DEV_MODE };
