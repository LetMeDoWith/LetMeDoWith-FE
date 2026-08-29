import type { ApiError } from 'services/apiClient';
import { useQuery } from '@tanstack/react-query';

import { TASK_QUERY_KEY } from 'constants/queries';
import { fetchDowithTaskSamples } from 'services/rest/task';
import type { fetchDowithTaskSamplesResponseSchemeType } from 'types/task/scheme/api';

const useFetchDowithTaskSamples = () =>
  useQuery<fetchDowithTaskSamplesResponseSchemeType, ApiError, string[]>({
    queryKey: TASK_QUERY_KEY.DOWITH_SAMPLE,
    queryFn: () => fetchDowithTaskSamples(),
    select: data => data.data,
  });

export { useFetchDowithTaskSamples };
