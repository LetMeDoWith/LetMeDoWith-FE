import { z } from 'zod';

import {
  dowithTaskScheme,
  fetchTaskCategoryListResponseScheme,
  fetchTaskListRequestScheme,
  fetchTaskListResponseDataScheme,
  fetchTaskListResponseScheme,
  taskCategoryScheme,
  todoTaskScheme,
} from 'schemes/task/api';

type taskCategorySchemeType = z.infer<typeof taskCategoryScheme>;
type fetchTaskCategoryListResponseSchemeType = z.infer<typeof fetchTaskCategoryListResponseScheme>;
type fetchTaskListRequestSchemeType = z.infer<typeof fetchTaskListRequestScheme>;
type todoTaskSchemeType = z.infer<typeof todoTaskScheme>;
type dowithTaskSchemeType = z.infer<typeof dowithTaskScheme>;
type fetchTaskListResponseSchemeDataType = z.infer<typeof fetchTaskListResponseDataScheme>;
type fetchTaskListResponseSchemeType = z.infer<typeof fetchTaskListResponseScheme>;

export type {
  taskCategorySchemeType,
  fetchTaskCategoryListResponseSchemeType,
  fetchTaskListRequestSchemeType,
  todoTaskSchemeType,
  dowithTaskSchemeType,
  fetchTaskListResponseSchemeDataType,
  fetchTaskListResponseSchemeType,
};
