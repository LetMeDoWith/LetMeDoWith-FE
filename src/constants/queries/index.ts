const AUTH_QUERY_KEY = {
  FETCH_TOKEN: ['auth', 'token'],
  REFRESH_TOKEN: ['auth', 'token', 'refresh'],
} as const;

const MEMBER_QUERY_KEY = {
  VALID_NICKNAME: ['member', 'valid', 'nickname'],
  SIGN_UP: ['member', 'signup'],
} as const;

const TASK_QUERY_KEY = {
  CATEGORY_LIST: ['task', 'category', 'list'],
  LIST: ['task', 'list'],
} as const;

export { AUTH_QUERY_KEY, MEMBER_QUERY_KEY, TASK_QUERY_KEY };
