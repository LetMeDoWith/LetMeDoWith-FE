import { apiClient } from 'services/apiClient';
import { TASK_API } from 'services/urls';
import type { fetchTaskCategoryListResponseSchemeType } from 'types/task/scheme/api';

const fetchTaskCategoryList = async (): Promise<fetchTaskCategoryListResponseSchemeType> => {
  try {
    const result = await apiClient.get<fetchTaskCategoryListResponseSchemeType>(TASK_API.CATEGORY_LIST);
    return result.data;
  } catch (e) {
    throw e;
  }
};

export { fetchTaskCategoryList };
