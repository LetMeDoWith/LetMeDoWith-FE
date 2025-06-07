import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';

import { TASK_QUERY_KEY } from 'constants/queries';
import { fetchTaskCategoryList } from 'services/rest/task';
import type { fetchTaskCategoryListResponseSchemeType, taskCategorySchemeType } from 'types/task/scheme/api';

const useFetchTaskCategoryList = () =>
  useQuery<fetchTaskCategoryListResponseSchemeType, AxiosError, taskCategorySchemeType[]>({
    queryKey: TASK_QUERY_KEY.CATEGORY_LIST,
    queryFn: () => fetchTaskCategoryList(),
    select: data => data.data,
  });

export { useFetchTaskCategoryList };
