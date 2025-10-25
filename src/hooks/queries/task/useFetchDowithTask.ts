import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';

import { TASK_QUERY_KEY } from 'constants/queries';
import { fetchDowithTask } from 'services/rest/task';
import type {
  addTaskRequestSchemeType,
  fetchDowithTaskRequestSchemeType,
  fetchDowithTaskResponseSchemeType,
} from 'types/task/scheme/api';

const useFetchDowithTask = ({ dowithTaskId }: fetchDowithTaskRequestSchemeType) =>
  useQuery<fetchDowithTaskResponseSchemeType, AxiosError, addTaskRequestSchemeType>({
    queryKey: [...TASK_QUERY_KEY.LIST, dowithTaskId],
    queryFn: () => fetchDowithTask({ dowithTaskId }),
    select: data => data.data,
  });

export { useFetchDowithTask };
