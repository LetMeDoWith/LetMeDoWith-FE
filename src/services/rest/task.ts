import { apiClient } from 'services/apiClient';
import { TASK_API } from 'services/urls';
import type { PageRequestSchemeType } from 'types/shared/scheme/api';
import type {
  addTaskRequestSchemeType,
  fetchDowithTaskRequestSchemeType,
  fetchDowithTaskResponseSchemeType,
  fetchTaskCategoryListResponseSchemeType,
  fetchTaskListRequestSchemeType,
  fetchTaskListResponseSchemeType,
  fetchTodoTaskRequestSchemeType,
  fetchTodoTaskResponseSchemeType,
  fetchSuccessDowithTasksResponseSchemeType,
  likeDowithTaskResponseSchemeType,
  unLikeDowithTaskResponseSchemeType,
  updateTaskRequestSchemeType,
  updateTaskRoutineRequestSchemeType,
  updateTodoTaskStatusResponseSchemeType,
  updateDowithTaskStatusSuccessRequestSchemeType,
  uploadTaskSuccessImageUrlListRequestSchemeType,
  uploadTaskSuccessImageUrlListResponseSchemeType,
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
  withRoutineTask,
  payload,
}: {
  type: 'EDIT' | 'DELETE';
  id: number;
  mode: TaskModeType;
  withRoutineTask: boolean;
  payload?: updateTaskRequestSchemeType;
}): Promise<string> => {
  try {
    const isTodoMode = mode === 'TODO';
    const isEditType = type === 'EDIT';
    const url = `${isTodoMode ? TASK_API.TODO : TASK_API.DOWITH}/${id}${withRoutineTask ? '/with-routine' : ''}`;
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

const fetchUploadTaskSuccessImageUrlList = async (
  id: number,
  payload: uploadTaskSuccessImageUrlListRequestSchemeType,
): Promise<uploadTaskSuccessImageUrlListResponseSchemeType> => {
  try {
    const result = await apiClient.post<uploadTaskSuccessImageUrlListResponseSchemeType>(
      TASK_API.UPLOAD_TASK_SUCCESS_IMAGE_URL_LIST.replace(':id', String(id)),
      payload,
    );
    return result.data;
  } catch (e) {
    throw e;
  }
};

const uploadFileToBucket = async (presignedUrl: string, fileUri: string, onProgress?: (progress: number) => void) => {
  try {
    // 로컬 파일 URI를 blob으로 변환
    const normalizedUri = fileUri.startsWith('file://') ? fileUri : `file://${fileUri}`;
    const fileResponse = await fetch(normalizedUri);
    const blob = await fileResponse.blob();

    /**
     * XMLHttpRequest를 사용하여 S3에 직접 업로드
     * axios는 React Native의 blob을 바이너리가 아닌 메타데이터 객체로 직렬화하여 이미지가 깨지는 문제가 있음
     * XMLHttpRequest는 React Native blob을 네이티브 바이너리로 올바르게 전송
     */
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader('Content-Type', 'image/jpeg');

      if (onProgress) {
        xhr.upload.onprogress = event => {
          if (event.lengthComputable) {
            onProgress((event.loaded / event.total) * 100);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`S3 업로드 실패: ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('S3 업로드 네트워크 에러'));
      xhr.send(blob);
    });

    console.log('S3 이미지 업로드 성공 !');
  } catch (e) {
    console.error('S3 이미지 업로드 에러:', e);
    throw e;
  }
};

const updateDowithTaskStatusSuccess = async (
  id: number,
  payload: updateDowithTaskStatusSuccessRequestSchemeType,
): Promise<undefined> => {
  try {
    const result = await apiClient.post<undefined>(TASK_API.SUCCESS_DOWITH.replace(':id', String(id)), payload);
    return result.data;
  } catch (e) {
    throw e;
  }
};

const fetchSuccessDowithTasks = async (
  params?: PageRequestSchemeType,
): Promise<fetchSuccessDowithTasksResponseSchemeType> => {
  try {
    const result = await apiClient.get<fetchSuccessDowithTasksResponseSchemeType>(TASK_API.SUCCESS_DOWITH_TASKS, {
      params,
    });
    return result.data;
  } catch (e) {
    throw e;
  }
};

const likeDowithTask = async (dowithTaskId: number): Promise<likeDowithTaskResponseSchemeType> => {
  try {
    const result = await apiClient.post<likeDowithTaskResponseSchemeType>(
      TASK_API.LIKE_DOWITH.replace(':id', String(dowithTaskId)),
    );
    return result.data;
  } catch (e) {
    throw e;
  }
};

const unLikeDowithTask = async (dowithTaskId: number): Promise<unLikeDowithTaskResponseSchemeType> => {
  try {
    const result = await apiClient.delete<unLikeDowithTaskResponseSchemeType>(
      TASK_API.LIKE_DOWITH.replace(':id', String(dowithTaskId)),
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
  fetchUploadTaskSuccessImageUrlList,
  updateDowithTaskStatusSuccess,
  uploadFileToBucket,
  fetchSuccessDowithTasks,
  likeDowithTask,
  unLikeDowithTask,
};
