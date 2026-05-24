import type { ApiError } from 'services/apiClient';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';

import { TASK_QUERY_KEY } from 'constants/queries';
import { DEFAULT_PAGE_SIZE } from 'constants/shared';
import { fetchFeedbackAvailableDowithTasks } from 'services/rest/task';
import type { fetchFeedbackAvailableDowithTasksResponseSchemeType } from 'types/task/scheme/api';

const useFetchFeedbackAvailableDowithTasksInfinite = () =>
  useInfiniteQuery<
    fetchFeedbackAvailableDowithTasksResponseSchemeType,
    ApiError,
    InfiniteData<fetchFeedbackAvailableDowithTasksResponseSchemeType, number>,
    readonly string[],
    number
  >({
    queryKey: [...TASK_QUERY_KEY.FEEDBACK_AVAILABLE_DOWITH_TASKS, 'infinite'],
    queryFn: ({ pageParam }) => fetchFeedbackAvailableDowithTasks({ page: pageParam, size: DEFAULT_PAGE_SIZE }),
    getNextPageParam: lastPage => {
      const currentPage = lastPage.page;
      const totalPage = lastPage.totalPage;
      return currentPage + 1 < totalPage ? currentPage + 1 : undefined;
    },
    initialPageParam: 0,
  });

export { useFetchFeedbackAvailableDowithTasksInfinite };
