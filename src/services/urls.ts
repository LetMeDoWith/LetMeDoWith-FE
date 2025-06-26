const AUTH_API = {
  FETCH_TOKEN: 'v1/auth/token',
  REFRESH_TOKEN: 'v1/auth/token/refresh',
} as const;

const MEMBER_API = {
  VALID_NICKNAME: 'v1/members/nickname',
  SIGN_UP: 'v1/members',
  DELETE_ACCOUNT: 'v1/members',
} as const;

const TASK_API = {
  CATEGORY_LIST: 'v1/tasks/category',
  LIST: 'v1/tasks',
  ADD_TODO: 'v1/tasks/todo',
} as const;

export { AUTH_API, MEMBER_API, TASK_API };
