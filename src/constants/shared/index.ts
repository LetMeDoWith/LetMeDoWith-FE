import { version } from '../../../package.json';
import { ErrorStatusCodeEnum } from 'schemes/shared/enum';

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

/*
 * 토큰 재발급이 불가능해 재로그인이 필요한 서버 코드 — 세션 만료 다이얼로그 후 로그인 화면으로 보낸다.
 * - E303: 재발급 때 서버(Redis)에 RTK가 없음(TTL 만료·Redis 초기화·운영자 삭제). 이름은 TOKEN_EXPIRED_BY_ADMIN이지만
 *   백엔드 RefreshTokenProvider에서 RTK 미존재 시 던진다. 재시도로 복구되지 않는다.
 * - E306·E307·E308: RTK의 소유자·ATK·User-Agent 불일치
 * 재발급 실패 처리(useRefreshTokenQuery)와 Sentry 분류(ApiKickoutError)가 함께 쓴다.
 */
const SESSION_EXPIRED_STATUS_CODES: string[] = [
  ErrorStatusCodeEnum.enum.E303,
  ErrorStatusCodeEnum.enum.E306,
  ErrorStatusCodeEnum.enum.E307,
  ErrorStatusCodeEnum.enum.E308,
];

export {
  SCREEN_NAME,
  APP_VERSION,
  LANGUAGE_CODE,
  LANGUAGE_CODE_VALUES,
  DEFAULT_PAGE_SIZE,
  SESSION_EXPIRED_STATUS_CODES,
};
export type { LanguageCodeType };
