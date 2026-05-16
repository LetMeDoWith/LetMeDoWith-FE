const AUTH_QUERY_KEY = {
  FETCH_TOKEN: ['auth', 'token'],
  REFRESH_TOKEN: ['auth', 'token', 'refresh'],
} as const;

const MEMBER_QUERY_KEY = {
  VALID_NICKNAME: ['member', 'valid', 'nickname'],
  SIGN_UP: ['member', 'signup'],
  DELETE_ACCOUNT: ['member', 'delete'],
  MY_DOWITH: ['member', 'my-dowith'],
} as const;

const TASK_QUERY_KEY = {
  CATEGORY_LIST: ['task', 'category', 'list'],
  LIST: ['task', 'list'],
  ADD_TODO: ['task', 'add', 'todo'],
  ADD_DOWITH: ['task', 'add', 'dowith'],
  UPDATE_TODO_STATUS: ['task', 'update', 'todo', 'status'],
  UPDATE: ['task', 'update'],
  UPDATE_ROUTINE: ['task', 'update', 'routine'],
  SUCCESS_DOWITH_TASKS: ['task', 'success', 'dowith'],
  FEEDBACK_AVAILABLE_DOWITH_TASKS: ['task', 'feedback-available', 'dowith'],
} as const;

const FEEDBACK_QUERY_KEY = {
  SEND: ['feedback', 'send'],
  RECEIVED: ['feedback', 'received'],
  TEMPLATES: ['feedback', 'templates'],
  DOWITH_TASK_AGGREGATE: ['feedback', 'dowith-task', 'aggregate'],
  DOWITH_TASK_FEEDBACKS: ['feedback', 'dowith-task', 'feedbacks'],
} as const;

const NOTIFICATION_QUERY_KEY = {
  ADD_TOKEN: ['notification', 'add', 'token'],
};

export { AUTH_QUERY_KEY, MEMBER_QUERY_KEY, TASK_QUERY_KEY, FEEDBACK_QUERY_KEY, NOTIFICATION_QUERY_KEY };
