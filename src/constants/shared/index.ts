import { version } from '../../../package.json';

const SCREEN_NAME = {
  HOME: 'HOME',
  FEED: 'FEED',
  MYPAGE: 'MYPAGE',
  SIGN_UP_USER_INFO: 'SIGN_UP_USER_INFO',
  SIGN_UP_AGREEMENT: 'SIGN_UP_AGREEMENT',
};

const APP_VERSION = version;

const LANGUAGE_CODE = {
  KR: 'KR',
  US: 'US',
  JP: 'JP',
  CN: 'CN',
  UK: 'UK',
} as const;

type LanguageCodeType = (typeof LANGUAGE_CODE)[keyof typeof LANGUAGE_CODE];

const LANGUAGE_CODE_VALUES = Object.values(LANGUAGE_CODE) as [LanguageCodeType, ...LanguageCodeType[]];

const DEFAULT_PAGE_SIZE = 20;

export { SCREEN_NAME, APP_VERSION, LANGUAGE_CODE, LANGUAGE_CODE_VALUES, DEFAULT_PAGE_SIZE };
export type { LanguageCodeType };
