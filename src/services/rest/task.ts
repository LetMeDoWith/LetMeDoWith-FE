import { apiClient } from 'services/apiClient';
import { TASK_API } from 'services/urls';
import type {
  addTaskRequestSchemeType,
  fetchTaskCategoryListResponseSchemeType,
  fetchTaskListRequestSchemeType,
  fetchTaskListResponseSchemeType,
  updateTodoTaskResponseSchemeType,
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
    const result = await apiClient.post<undefined>(TASK_API.ADD_TODO, payload);
    return result.data;
  } catch (e) {
    throw e;
  }
};

const addDowithTask = async (payload: addTaskRequestSchemeType): Promise<undefined> => {
  try {
    const result = await apiClient.post<undefined>(TASK_API.ADD_DOWITH, payload);
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
}): Promise<updateTodoTaskResponseSchemeType> => {
  try {
    const baseUrl = status === TASK_STATUS_ENUM.enum.WAIT ? TASK_API.SUCCESS_TODO : TASK_API.WAIT_TODO;
    const result = await apiClient.patch<updateTodoTaskResponseSchemeType>(baseUrl.replace(':id', String(id)));
    return result.data;
  } catch (e) {
    throw e;
  }
};

export { fetchTaskCategoryList, fetchTaskList, addTodoTask, addDowithTask, updateStatusTodoTask };
