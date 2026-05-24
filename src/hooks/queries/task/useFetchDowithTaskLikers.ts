import type { ApiError } from 'services/apiClient';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';

import { TASK_QUERY_KEY } from 'constants/queries';
import { DEFAULT_PAGE_SIZE } from 'constants/shared';
import { fetchDowithTaskLikers } from 'services/rest/task';
import type { fetchDowithTaskLikersResponseSchemeType } from 'types/task/scheme/api';

const useFetchDowithTaskLikers = (dowithTaskId: number, enabled = true) =>
  useInfiniteQuery<
    fetchDowithTaskLikersResponseSchemeType,
    ApiError,
    InfiniteData<fetchDowithTaskLikersResponseSchemeType, number>,
    readonly (string | number)[],
    number
  >({
    queryKey: [...TASK_QUERY_KEY.DOWITH_TASK_LIKERS, dowithTaskId],
    queryFn: ({ pageParam }) => fetchDowithTaskLikers(dowithTaskId, { page: pageParam, size: DEFAULT_PAGE_SIZE }),
    getNextPageParam: lastPage => {
      const currentPage = lastPage.page;
      const totalPage = lastPage.totalPage;
      return currentPage + 1 < totalPage ? currentPage + 1 : undefined;
    },
    initialPageParam: 0,
    enabled,
  });

export { useFetchDowithTaskLikers };
