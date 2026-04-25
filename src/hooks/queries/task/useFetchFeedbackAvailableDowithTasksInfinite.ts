import { AxiosError } from 'axios';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';

import { TASK_QUERY_KEY } from 'constants/queries';
import { fetchFeedbackAvailableDowithTasks } from 'services/rest/task';
import type { fetchFeedbackAvailableDowithTasksResponseSchemeType } from 'types/task/scheme/api';

const PAGE_SIZE = 10;

const useFetchFeedbackAvailableDowithTasksInfinite = () =>
  useInfiniteQuery<
    fetchFeedbackAvailableDowithTasksResponseSchemeType,
    AxiosError,
    InfiniteData<fetchFeedbackAvailableDowithTasksResponseSchemeType, number>,
    readonly string[],
    number
  >({
    queryKey: [...TASK_QUERY_KEY.FEEDBACK_AVAILABLE_DOWITH_TASKS, 'infinite'],
    queryFn: ({ pageParam }) => fetchFeedbackAvailableDowithTasks({ page: pageParam, size: PAGE_SIZE }),
    getNextPageParam: lastPage => {
      const currentPage = lastPage.page;
      const totalPage = lastPage.totalPage;
      return currentPage + 1 < totalPage ? currentPage + 1 : undefined;
    },
    initialPageParam: 0,
  });

export { useFetchFeedbackAvailableDowithTasksInfinite };
