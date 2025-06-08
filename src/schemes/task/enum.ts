import { z } from 'zod';

const CREATION_TYPE_ENUM = z.enum(['COMMON', 'USER_CUSTOM']);
const TASK_STATUS_ENUM = z.enum(['WAIT', 'SUCCESS', 'FAIL']);

export { CREATION_TYPE_ENUM, TASK_STATUS_ENUM };
