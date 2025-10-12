import { AxiosError } from 'axios';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { TASK_QUERY_KEY } from 'constants/queries';
import { fetchTodoTask } from 'services/rest/task';
import type {
  fetchTodoTaskRequestSchemeType,
  fetchTodoTaskResponseDataSchemeType,
  fetchTodoTaskResponseSchemeType,
} from 'types/task/scheme/api';

const useFetchTodoTask = (
  { todoTaskId }: fetchTodoTaskRequestSchemeType,
  options?: Omit<
    UseQueryOptions<fetchTodoTaskResponseSchemeType, AxiosError, fetchTodoTaskResponseDataSchemeType>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery<fetchTodoTaskResponseSchemeType, AxiosError, fetchTodoTaskResponseDataSchemeType>({
    queryKey: [...TASK_QUERY_KEY.LIST, 'todo', todoTaskId],
    queryFn: () => fetchTodoTask({ todoTaskId }),
    select: data => data.data,
    ...options,
  });

export { useFetchTodoTask };
