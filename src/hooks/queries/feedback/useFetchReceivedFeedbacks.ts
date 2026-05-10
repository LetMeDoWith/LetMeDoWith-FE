import type { ApiError } from 'services/apiClient';
import { useQuery } from '@tanstack/react-query';

import { FEEDBACK_QUERY_KEY } from 'constants/queries';
import { fetchReceivedFeedbacks } from 'services/rest/feedback';
import type { PageRequestSchemeType } from 'types/shared/scheme/api';
import type { fetchReceivedFeedbacksResponseSchemeType, receivedFeedbackSchemeType } from 'types/feedback/scheme/api';

type ReceivedFeedbacksResult = {
  feedbacks: receivedFeedbackSchemeType[];
  totalCount: number;
};

const useFetchReceivedFeedbacks = (params?: PageRequestSchemeType) =>
  useQuery<fetchReceivedFeedbacksResponseSchemeType, ApiError, ReceivedFeedbacksResult>({
    queryKey: [...FEEDBACK_QUERY_KEY.RECEIVED, params?.page, params?.size],
    queryFn: () => fetchReceivedFeedbacks(params),
    select: data => ({
      feedbacks: data.data.feedbacks,
      totalCount: data.totalCount,
    }),
  });

export { useFetchReceivedFeedbacks };
