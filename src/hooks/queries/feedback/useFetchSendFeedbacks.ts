import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';

import { FEEDBACK_QUERY_KEY } from 'constants/queries';
import { fetchSendFeedbacks } from 'services/rest/feedback';
import type { PageRequestSchemeType } from 'types/shared/scheme/api';
import type { fetchSendFeedbacksResponseSchemeType, sendFeedbackSchemeType } from 'types/feedback/scheme/api';

type SendFeedbacksResult = {
  feedbacks: sendFeedbackSchemeType[];
  totalCount: number;
};

const useFetchSendFeedbacks = (params?: PageRequestSchemeType) =>
  useQuery<fetchSendFeedbacksResponseSchemeType, AxiosError, SendFeedbacksResult>({
    queryKey: [...FEEDBACK_QUERY_KEY.SEND, params?.page, params?.size],
    queryFn: () => fetchSendFeedbacks(params),
    select: data => ({
      feedbacks: data.data.feedbacks,
      totalCount: data.totalCount,
    }),
  });

export { useFetchSendFeedbacks };
