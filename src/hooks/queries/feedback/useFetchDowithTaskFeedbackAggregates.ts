import { useQuery } from '@tanstack/react-query';

import type { ApiError } from 'services/apiClient';
import { FEEDBACK_QUERY_KEY } from 'constants/queries';
import { fetchDowithTaskFeedbackAggregates } from 'services/rest/feedback';
import type {
  fetchFeedbackAggregatesResponseSchemeType,
  feedbackAggregateItemSchemeType,
} from 'types/feedback/scheme/api';
import { toThrowOnError, type BoundaryQueryOptions } from 'utils/error';

const useFetchDowithTaskFeedbackAggregates = (
  dowithTaskId: number,
  enabled = true,
  { throwOnError }: BoundaryQueryOptions = {},
) =>
  useQuery<fetchFeedbackAggregatesResponseSchemeType, ApiError, feedbackAggregateItemSchemeType[]>({
    queryKey: [...FEEDBACK_QUERY_KEY.DOWITH_TASK_AGGREGATE, dowithTaskId],
    queryFn: () => fetchDowithTaskFeedbackAggregates(dowithTaskId),
    select: data => [...data.data.aggregates].sort((a, b) => b.count - a.count),
    enabled,
    throwOnError: toThrowOnError(throwOnError),
  });

export { useFetchDowithTaskFeedbackAggregates };
