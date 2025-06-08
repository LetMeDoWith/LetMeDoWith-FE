import { z } from 'zod';

import { TASK_STATUS_ENUM } from 'schemes/task/enum';

type TaskStatusEnumType = z.infer<typeof TASK_STATUS_ENUM>;

export type { TaskStatusEnumType };
