const AUTH_QUERY_KEY = {
  FETCH_TOKEN: ['auth', 'token'],
  REFRESH_TOKEN: ['auth', 'token', 'refresh'],
} as const;

const MEMBER_QUERY_KEY = {
  VALID_NICKNAME: ['member', 'valid', 'nickname'],
  SIGN_UP: ['member', 'signup'],
  DELETE_ACCOUNT: ['member', 'delete'],
} as const;

const TASK_QUERY_KEY = {
  CATEGORY_LIST: ['task', 'category', 'list'],
  LIST: ['task', 'list'],
  ADD_TODO: ['task', 'add', 'todo'],
  ADD_DOWITH: ['task', 'add', 'dowith'],
  UPDATE_TODO_STATUS: ['task', 'update', 'todo', 'status'],
} as const;

export { AUTH_QUERY_KEY, MEMBER_QUERY_KEY, TASK_QUERY_KEY };
