import { apiClient } from 'services/apiClient';
import { TASK_API } from 'services/urls';
import type {
  addTaskRequestSchemeType,
  fetchDowithTaskRequestSchemeType,
  fetchDowithTaskResponseSchemeType,
  fetchTaskCategoryListResponseSchemeType,
  fetchTaskListRequestSchemeType,
  fetchTaskListResponseSchemeType,
  fetchTodoTaskRequestSchemeType,
  fetchTodoTaskResponseSchemeType,
  updateTaskRequestSchemeType,
  updateTodoTaskStatusResponseSchemeType,
} from 'types/task/scheme/api';
import type { TaskStatusEnumType } from 'types/task/scheme/enum';
import { TASK_STATUS_ENUM } from 'schemes/task/enum';

const fetchTaskCategoryList = async (): Promise<fetchTaskCategoryListResponseSchemeType> => {
  try {
    const result = await apiClient.get<fetchTaskCategoryListResponseSchemeType>(TASK_API.CATEGORY_LIST);
    return result.data;
  } catch (e) {
    throw e;
  }
};

const fetchTaskList = async (params: fetchTaskListRequestSchemeType): Promise<fetchTaskListResponseSchemeType> => {
  try {
    const result = await apiClient.get<fetchTaskListResponseSchemeType>(TASK_API.LIST, {
      params,
    });
    return result.data;
  } catch (e) {
    throw e;
  }
};

const addTodoTask = async (payload: addTaskRequestSchemeType): Promise<undefined> => {
  try {
    const result = await apiClient.post<undefined>(TASK_API.TODO, payload);
    return result.data;
  } catch (e) {
    throw e;
  }
};

const fetchTodoTask = async ({
  todoTaskId,
}: fetchTodoTaskRequestSchemeType): Promise<fetchTodoTaskResponseSchemeType> => {
  try {
    const result = await apiClient.get<fetchTodoTaskResponseSchemeType>(`${TASK_API.TODO}/${todoTaskId}`);
    return result.data;
  } catch (e) {
    throw e;
  }
};

const fetchDowithTask = async ({
  dowithTaskId,
}: fetchDowithTaskRequestSchemeType): Promise<fetchDowithTaskResponseSchemeType> => {
  try {
    const result = await apiClient.get<fetchDowithTaskResponseSchemeType>(`${TASK_API.DOWITH}/${dowithTaskId}`);
    return result.data;
  } catch (e) {
    throw e;
  }
};

const addDowithTask = async (payload: addTaskRequestSchemeType): Promise<undefined> => {
  try {
    const result = await apiClient.post<undefined>(TASK_API.DOWITH, payload);
    return result.data;
  } catch (e) {
    throw e;
  }
};

const updateStatusTodoTask = async ({
  id,
  status,
}: {
  id: number;
  status: TaskStatusEnumType;
}): Promise<updateTodoTaskStatusResponseSchemeType> => {
  try {
    const baseUrl = status === TASK_STATUS_ENUM.enum.WAIT ? TASK_API.SUCCESS_TODO : TASK_API.WAIT_TODO;
    const result = await apiClient.patch<updateTodoTaskStatusResponseSchemeType>(baseUrl.replace(':id', String(id)));
    return result.data;
  } catch (e) {
    throw e;
  }
};

const updateTodoTask = async ({
  id,
  payload,
}: {
  id: number;
  payload: updateTaskRequestSchemeType;
}): Promise<string> => {
  try {
    const result = await apiClient.put<string>(`${TASK_API.TODO}/${id}`, payload);
    return result.data;
  } catch (e) {
    throw e;
  }
};

export {
  fetchTaskCategoryList,
  fetchTaskList,
  addTodoTask,
  fetchTodoTask,
  fetchDowithTask,
  addDowithTask,
  updateStatusTodoTask,
  updateTodoTask,
};
