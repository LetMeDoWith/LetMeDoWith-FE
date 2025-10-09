import { z } from 'zod';

import {
  addTaskRequestScheme,
  dowithTaskScheme,
  fetchTaskCategoryListResponseScheme,
  fetchTaskListRequestScheme,
  fetchTaskListResponseDataScheme,
  fetchTaskListResponseScheme,
  updateTodoTaskResponseScheme,
  taskCategoryScheme,
  todoTaskScheme,
  fetchDowithTaskRequestScheme,
  fetchDowithTaskResponseScheme,
} from 'schemes/task/api';

type taskCategorySchemeType = z.infer<typeof taskCategoryScheme>;
type fetchTaskCategoryListResponseSchemeType = z.infer<typeof fetchTaskCategoryListResponseScheme>;
type fetchDowithTaskRequestSchemeType = z.infer<typeof fetchDowithTaskRequestScheme>;
type fetchDowithTaskResponseSchemeType = z.infer<typeof fetchDowithTaskResponseScheme>;
type fetchTaskListRequestSchemeType = z.infer<typeof fetchTaskListRequestScheme>;
type todoTaskSchemeType = z.infer<typeof todoTaskScheme>;
type dowithTaskSchemeType = z.infer<typeof dowithTaskScheme>;
type fetchTaskListResponseSchemeDataType = z.infer<typeof fetchTaskListResponseDataScheme>;
type fetchTaskListResponseSchemeType = z.infer<typeof fetchTaskListResponseScheme>;
type addTaskRequestSchemeType = z.infer<typeof addTaskRequestScheme>;
type updateTodoTaskResponseSchemeType = z.infer<typeof updateTodoTaskResponseScheme>;

export type {
  taskCategorySchemeType,
  fetchTaskCategoryListResponseSchemeType,
  fetchDowithTaskRequestSchemeType,
  fetchDowithTaskResponseSchemeType,
  fetchTaskListRequestSchemeType,
  todoTaskSchemeType,
  dowithTaskSchemeType,
  fetchTaskListResponseSchemeDataType,
  fetchTaskListResponseSchemeType,
  addTaskRequestSchemeType,
  updateTodoTaskResponseSchemeType,
};
