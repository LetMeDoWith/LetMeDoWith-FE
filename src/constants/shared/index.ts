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

/*
 * 화면에서 다이얼로그로 따로 안내하는 서버 코드. 전역 에러 처리(App.tsx)는 이 코드면 공통 에러 스낵바를 띄우지 않는다
 * — 같은 에러에 다이얼로그와 스낵바가 겹쳐 뜨지 않게. 새 에러를 다이얼로그로 처리하면 여기에 코드를 추가한다.
 * - 세션 만료: useRefreshTokenQuery "세션 만료" 다이얼로그
 * - E250(잡도리 쿨타임): FeedNagItem "잡도리 쿨타임" 다이얼로그
 */
const DIALOG_HANDLED_STATUS_CODES: string[] = [...SESSION_EXPIRED_STATUS_CODES, ErrorStatusCodeEnum.enum.E250];

/*
 * 약관 원문은 노션 공개 페이지로 관리한다. 앱 내 뷰어가 없어 외부 브라우저로 연다.
 * 회원가입 약관 동의 화면과 설정 > 이용약관 화면이 같은 주소를 쓴다.
 */
const POLICY_URL = {
  TERMS_OF_SERVICE: 'https://far-coconut-eec.notion.site/5f4ae42e50364b10a67799c2675ea3f6',
  PRIVACY: 'https://far-coconut-eec.notion.site/afd1661a34734eae9696511f2f511d3d',
} as const;

export {
  SCREEN_NAME,
  APP_VERSION,
  LANGUAGE_CODE,
  LANGUAGE_CODE_VALUES,
  DEFAULT_PAGE_SIZE,
  SESSION_EXPIRED_STATUS_CODES,
  DIALOG_HANDLED_STATUS_CODES,
  POLICY_URL,
};
export type { LanguageCodeType };
