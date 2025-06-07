import { z } from 'zod';

import { fetchTaskCategoryListResponseScheme, taskCategoryScheme } from 'schemes/task/api';

type taskCategorySchemeType = z.infer<typeof taskCategoryScheme>;
type fetchTaskCategoryListResponseSchemeType = z.infer<typeof fetchTaskCategoryListResponseScheme>;

export type { taskCategorySchemeType, fetchTaskCategoryListResponseSchemeType };
