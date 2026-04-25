import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';

import { FEEDBACK_QUERY_KEY } from 'constants/queries';
import { fetchSentFeedbacks } from 'services/rest/feedback';
import type { PageRequestSchemeType } from 'types/shared/scheme/api';
import type { fetchSentFeedbacksResponseSchemeType, sentFeedbackSchemeType } from 'types/feedback/scheme/api';

type SentFeedbacksResult = {
  feedbacks: sentFeedbackSchemeType[];
  totalCount: number;
};

const useFetchSendFeedbacks = (params?: PageRequestSchemeType) =>
  useQuery<fetchSentFeedbacksResponseSchemeType, AxiosError, SentFeedbacksResult>({
    queryKey: [...FEEDBACK_QUERY_KEY.SEND, params?.page, params?.size],
    queryFn: () => fetchSentFeedbacks(params),
    select: data => ({
      feedbacks: data.data.feedbacks,
      totalCount: data.totalCount,
    }),
  });

export { useFetchSendFeedbacks };
