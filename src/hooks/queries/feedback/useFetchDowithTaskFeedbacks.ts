import type { ApiError } from 'services/apiClient';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';

import { FEEDBACK_QUERY_KEY } from 'constants/queries';
import { DEFAULT_PAGE_SIZE } from 'constants/shared';
import { fetchDowithTaskFeedbacks } from 'services/rest/feedback';
import type { fetchDowithTaskFeedbacksResponseSchemeType } from 'types/feedback/scheme/api';

const useFetchDowithTaskFeedbacks = (dowithTaskId: number, feedbackTemplateId: number | null) =>
  useInfiniteQuery<
    fetchDowithTaskFeedbacksResponseSchemeType,
    ApiError,
    InfiniteData<fetchDowithTaskFeedbacksResponseSchemeType, number>,
    readonly (string | number | null)[],
    number
  >({
    queryKey: [...FEEDBACK_QUERY_KEY.DOWITH_TASK_FEEDBACKS, dowithTaskId, feedbackTemplateId],
    queryFn: ({ pageParam }) =>
      fetchDowithTaskFeedbacks(dowithTaskId, {
        feedbackTemplateId: feedbackTemplateId!,
        page: pageParam,
        size: DEFAULT_PAGE_SIZE,
      }),
    getNextPageParam: lastPage => {
      const currentPage = lastPage.page;
      const totalPage = lastPage.totalPage;
      return currentPage + 1 < totalPage ? currentPage + 1 : undefined;
    },
    initialPageParam: 0,
    enabled: feedbackTemplateId !== null,
    placeholderData: previousData => previousData,
  });

export { useFetchDowithTaskFeedbacks };
