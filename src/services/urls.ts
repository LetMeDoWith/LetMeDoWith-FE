const AUTH_API = {
  FETCH_TOKEN: 'v1/auth/token',
  REFRESH_TOKEN: 'v1/auth/token/refresh',
} as const;

const MEMBER_API = {
  VALID_NICKNAME: 'v1/members/nickname',
  SIGN_UP: 'v1/members',
  DELETE_ACCOUNT: 'v1/members',
  NOTIFICATION_SETTINGS: 'v1/members/settings/notification',
} as const;

const TASK_API = {
  CATEGORY_LIST: 'v1/tasks/category',
  LIST: 'v1/tasks',
  TODO: 'v1/tasks/todo',
  DOWITH: 'v1/tasks/dowith',
  SUCCESS_TODO: 'v1/tasks/todo/:id/success',
  WAIT_TODO: 'v1/tasks/todo/:id/wait',
  UPLOAD_TASK_SUCCESS_IMAGE_URL_LIST: 'v1/tasks/dowith/:id/success/image/upload-presigned-url',
  SUCCESS_DOWITH: 'v1/tasks/dowith/:id/success',
} as const;

const NOTIFICATION_API = {
  ADD_TOKEN: 'v1/notifications/tokens',
};

export { AUTH_API, MEMBER_API, TASK_API, NOTIFICATION_API };
