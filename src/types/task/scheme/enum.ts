import { z } from 'zod';

import { TASK_ROUTINE_CYCLE_ENUM, TASK_STATUS_ENUM } from 'schemes/task/enum';

type TaskStatusEnumType = z.infer<typeof TASK_STATUS_ENUM>;
type TaskRoutineCycleEnumType = z.infer<typeof TASK_ROUTINE_CYCLE_ENUM>;

export type { TaskStatusEnumType, TaskRoutineCycleEnumType };
