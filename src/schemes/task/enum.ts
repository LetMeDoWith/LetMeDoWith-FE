import { z } from 'zod';

const CREATION_TYPE_ENUM = z.enum(['COMMON', 'USER_CUSTOM']);

export { CREATION_TYPE_ENUM };
