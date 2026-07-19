import type { ApiError } from 'services/apiClient';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';

import { FEEDBACK_QUERY_KEY } from 'constants/queries';
import { DEFAULT_PAGE_SIZE } from 'constants/shared';
import { fetchSentFeedbacks } from 'services/rest/feedback';
import type { fetchSentFeedbacksResponseSchemeType } from 'types/feedback/scheme/api';

const useFetchSendFeedbacks = () =>
  useInfiniteQuery<
    fetchSentFeedbacksResponseSchemeType,
    ApiError,
    InfiniteData<fetchSentFeedbacksResponseSchemeType, number>,
    readonly string[],
    number
  >({
    queryKey: [...FEEDBACK_QUERY_KEY.SEND],
    queryFn: ({ pageParam }) => fetchSentFeedbacks({ page: pageParam, size: DEFAULT_PAGE_SIZE }),
    getNextPageParam: lastPage => {
      const currentPage = lastPage.page;
      const totalPage = lastPage.totalPage;
      return currentPage + 1 < totalPage ? currentPage + 1 : undefined;
    },
    initialPageParam: 0,
  });

export { useFetchSendFeedbacks };
