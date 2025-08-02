import { apiClient } from 'services/apiClient';
import { TASK_API } from 'services/urls';
import type {
  addTaskRequestSchemeType,
  addTodoTaskResponseSchemeType,
  fetchTaskCategoryListResponseSchemeType,
  fetchTaskListRequestSchemeType,
  fetchTaskListResponseSchemeType,
} from 'types/task/scheme/api';

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

const addTodoTask = async (payload: addTaskRequestSchemeType): Promise<addTodoTaskResponseSchemeType> => {
  try {
    const result = await apiClient.post<addTodoTaskResponseSchemeType>(TASK_API.ADD_TODO, payload);
    return result.data;
  } catch (e) {
    throw e;
  }
};

const addDowithTask = async (payload: addTaskRequestSchemeType): Promise<string> => {
  try {
    const result = await apiClient.post<string>(TASK_API.ADD_DOWITH, payload);
    return result.data;
  } catch (e) {
    throw e;
  }
};

export { fetchTaskCategoryList, fetchTaskList, addTodoTask, addDowithTask };
