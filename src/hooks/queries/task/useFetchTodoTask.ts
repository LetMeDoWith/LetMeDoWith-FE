import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';

import { TASK_QUERY_KEY } from 'constants/queries';
import { fetchTodoTask } from 'services/rest/task';
import type {
  fetchTodoTaskRequestSchemeType,
  fetchTodoTaskResponseDataSchemeType,
  fetchTodoTaskResponseSchemeType,
} from 'types/task/scheme/api';

const useFetchTodoTask = ({ todoTaskId }: fetchTodoTaskRequestSchemeType) =>
  useQuery<fetchTodoTaskResponseSchemeType, AxiosError, fetchTodoTaskResponseDataSchemeType>({
    queryKey: [...TASK_QUERY_KEY.LIST, todoTaskId],
    queryFn: () => fetchTodoTask({ todoTaskId }),
    select: data => data.data,
  });

export { useFetchTodoTask };
