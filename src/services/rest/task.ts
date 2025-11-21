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
  updateTaskRoutineRequestSchemeType,
  updateTodoTaskStatusResponseSchemeType,
} from 'types/task/scheme/api';
import type { TaskStatusEnumType } from 'types/task/scheme/enum';
import type { TaskModeType } from 'types/shared';
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

const updateTask = async ({
  type,
  id,
  mode,
  isRoutineTask,
  payload,
}: {
  type: 'EDIT' | 'DELETE';
  id: number;
  mode: TaskModeType;
  isRoutineTask: boolean;
  payload?: updateTaskRequestSchemeType;
}): Promise<string> => {
  try {
    const isTodoMode = mode === 'TODO';
    const isEditType = type === 'EDIT';
    const url = `${isTodoMode ? TASK_API.TODO : TASK_API.DOWITH}/${id}${isRoutineTask ? '/with-routine' : ''}`;
    const result = isEditType ? await apiClient.put<string>(url, payload) : await apiClient.delete<string>(url);
    return result.data;
  } catch (e) {
    throw e;
  }
};

const updateTaskRoutine = async ({
  mode,
  id,
  payload,
}: {
  mode: TaskModeType;
  id: number;
  payload?: updateTaskRoutineRequestSchemeType;
}): Promise<string> => {
  try {
    const isTodoMode = mode === 'TODO';
    const result = await apiClient.put<string>(
      `${isTodoMode ? TASK_API.TODO : TASK_API.DOWITH}/${id}/routine`,
      payload,
    );
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
  updateTask,
  updateTaskRoutine,
};
