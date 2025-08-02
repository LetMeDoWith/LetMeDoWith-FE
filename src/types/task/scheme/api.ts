import { z } from 'zod';

import {
  addTaskRequestScheme,
  addTodoTaskResponseDataScheme,
  addTodoTaskResponseScheme,
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
type addTaskRequestSchemeType = z.infer<typeof addTaskRequestScheme>;
type addTodoTaskResponseDataSchemeType = z.infer<typeof addTodoTaskResponseDataScheme>;
type addTodoTaskResponseSchemeType = z.infer<typeof addTodoTaskResponseScheme>;

export type {
  taskCategorySchemeType,
  fetchTaskCategoryListResponseSchemeType,
  fetchTaskListRequestSchemeType,
  todoTaskSchemeType,
  dowithTaskSchemeType,
  fetchTaskListResponseSchemeDataType,
  fetchTaskListResponseSchemeType,
  addTaskRequestSchemeType,
  addTodoTaskResponseDataSchemeType,
  addTodoTaskResponseSchemeType,
};
