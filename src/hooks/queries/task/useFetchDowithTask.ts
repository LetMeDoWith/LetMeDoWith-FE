import type { ApiError } from 'services/apiClient';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { TASK_QUERY_KEY } from 'constants/queries';
import { fetchDowithTask } from 'services/rest/task';
import type {
  addTaskRequestSchemeType,
  fetchDowithTaskRequestSchemeType,
  fetchDowithTaskResponseSchemeType,
} from 'types/task/scheme/api';

const useFetchDowithTask = (
  { dowithTaskId }: fetchDowithTaskRequestSchemeType,
  options?: Omit<
    UseQueryOptions<fetchDowithTaskResponseSchemeType, ApiError, addTaskRequestSchemeType>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery<fetchDowithTaskResponseSchemeType, ApiError, addTaskRequestSchemeType>({
    queryKey: [...TASK_QUERY_KEY.LIST, 'dowith', dowithTaskId],
    queryFn: () => fetchDowithTask({ dowithTaskId }),
    select: data => data.data,
    ...options,
  });

export { useFetchDowithTask };
