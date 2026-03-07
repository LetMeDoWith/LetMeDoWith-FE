import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';

import { TASK_QUERY_KEY } from 'constants/queries';
import { fetchSuccessDowithTasks } from 'services/rest/task';
import type { PageRequestSchemeType } from 'types/shared/scheme/api';
import type { fetchSuccessDowithTasksResponseSchemeType, successDowithTaskSchemeType } from 'types/task/scheme/api';

const useFetchSuccessDowithTasks = (params?: PageRequestSchemeType) =>
  useQuery<fetchSuccessDowithTasksResponseSchemeType, AxiosError, successDowithTaskSchemeType[]>({
    queryKey: [...TASK_QUERY_KEY.SUCCESS_DOWITH_TASKS, params?.page, params?.size],
    queryFn: () => fetchSuccessDowithTasks(params),
    select: data => data.data.successDowithTasks,
  });

export { useFetchSuccessDowithTasks };
