import { z } from 'zod';

import {
  addTaskRequestScheme,
  dowithTaskScheme,
  fetchTaskCategoryListResponseScheme,
  fetchTaskListRequestScheme,
  fetchTaskListResponseDataScheme,
  fetchTaskListResponseScheme,
  updateTodoTaskStatusResponseScheme,
  taskCategoryScheme,
  todoTaskScheme,
  fetchDowithTaskRequestScheme,
  fetchDowithTaskResponseScheme,
  fetchTodoTaskResponseScheme,
  fetchTodoTaskRequestScheme,
  fetchTodoTaskResponseDataScheme,
  updateTaskRequestScheme,
  taskFormScheme,
  updateTaskRoutineRequestScheme,
  uploadTaskSuccessImageUrlListRequestScheme,
  uploadTaskSuccessImageUrlListResponseScheme,
} from 'schemes/task/api';

type taskCategorySchemeType = z.infer<typeof taskCategoryScheme>;
type fetchTaskCategoryListResponseSchemeType = z.infer<typeof fetchTaskCategoryListResponseScheme>;
type fetchTodoTaskRequestSchemeType = z.infer<typeof fetchTodoTaskRequestScheme>;
type fetchTodoTaskResponseDataSchemeType = z.infer<typeof fetchTodoTaskResponseDataScheme>;
type fetchTodoTaskResponseSchemeType = z.infer<typeof fetchTodoTaskResponseScheme>;
type fetchDowithTaskRequestSchemeType = z.infer<typeof fetchDowithTaskRequestScheme>;
type fetchDowithTaskResponseSchemeType = z.infer<typeof fetchDowithTaskResponseScheme>;
type fetchTaskListRequestSchemeType = z.infer<typeof fetchTaskListRequestScheme>;
type todoTaskSchemeType = z.infer<typeof todoTaskScheme>;
type dowithTaskSchemeType = z.infer<typeof dowithTaskScheme>;
type fetchTaskListResponseSchemeDataType = z.infer<typeof fetchTaskListResponseDataScheme>;
type fetchTaskListResponseSchemeType = z.infer<typeof fetchTaskListResponseScheme>;
type addTaskRequestSchemeType = z.infer<typeof addTaskRequestScheme>;
type taskFormSchemeType = z.infer<typeof taskFormScheme>;
type updateTodoTaskStatusResponseSchemeType = z.infer<typeof updateTodoTaskStatusResponseScheme>;
type updateTaskRequestSchemeType = z.infer<typeof updateTaskRequestScheme>;
type updateTaskRoutineRequestSchemeType = z.infer<typeof updateTaskRoutineRequestScheme>;
type uploadTaskSuccessImageUrlListRequestSchemeType = z.infer<typeof uploadTaskSuccessImageUrlListRequestScheme>;
type uploadTaskSuccessImageUrlListResponseSchemeType = z.infer<typeof uploadTaskSuccessImageUrlListResponseScheme>;

export type {
  taskCategorySchemeType,
  fetchTaskCategoryListResponseSchemeType,
  fetchTodoTaskRequestSchemeType,
  fetchTodoTaskResponseDataSchemeType,
  fetchTodoTaskResponseSchemeType,
  fetchDowithTaskRequestSchemeType,
  fetchDowithTaskResponseSchemeType,
  fetchTaskListRequestSchemeType,
  todoTaskSchemeType,
  dowithTaskSchemeType,
  fetchTaskListResponseSchemeDataType,
  fetchTaskListResponseSchemeType,
  addTaskRequestSchemeType,
  taskFormSchemeType,
  updateTodoTaskStatusResponseSchemeType,
  updateTaskRequestSchemeType,
  updateTaskRoutineRequestSchemeType,
  uploadTaskSuccessImageUrlListRequestSchemeType,
  uploadTaskSuccessImageUrlListResponseSchemeType,
};
