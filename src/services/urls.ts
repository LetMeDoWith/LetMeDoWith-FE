const AUTH_API = {
  FETCH_TOKEN: 'v1/auth/token',
  REFRESH_TOKEN: 'v1/auth/token/refresh',
} as const;

const MEMBER_API = {
  VALID_NICKNAME: 'v1/member/nickname',
} as const;

export { AUTH_API, MEMBER_API };
