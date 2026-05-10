import type { ApiError } from 'services/apiClient';
import { useQuery } from '@tanstack/react-query';

import { TASK_QUERY_KEY } from 'constants/queries';
import { fetchTaskList } from 'services/rest/task';
import type {
  fetchTaskListRequestSchemeType,
  fetchTaskListResponseSchemeDataType,
  fetchTaskListResponseSchemeType,
} from 'types/task/scheme/api';

const useFetchTaskList = ({ year, month }: fetchTaskListRequestSchemeType) =>
  useQuery<fetchTaskListResponseSchemeType, ApiError, fetchTaskListResponseSchemeDataType>({
    queryKey: [...TASK_QUERY_KEY.LIST, year, month],
    queryFn: () => fetchTaskList({ year, month }),
    select: data => data.data,
  });

export { useFetchTaskList };
