import type { ApiError } from 'services/apiClient';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';

import { NOTICE_QUERY_KEY } from 'constants/queries';
import { DEFAULT_PAGE_SIZE } from 'constants/shared';
import { fetchNotices } from 'services/rest/notice';
import type { fetchNoticesResponseSchemeType } from 'types/notice/scheme/api';

type NoticeType = 'NOTICE' | 'EVENT';

const useFetchNotices = (type?: NoticeType) =>
  useInfiniteQuery<
    fetchNoticesResponseSchemeType,
    ApiError,
    InfiniteData<fetchNoticesResponseSchemeType, number>,
    readonly (string | NoticeType | undefined)[],
    number
  >({
    queryKey: [...NOTICE_QUERY_KEY.LIST, type],
    queryFn: ({ pageParam }) => fetchNotices({ type, page: pageParam, size: DEFAULT_PAGE_SIZE }),
    getNextPageParam: lastPage => {
      const currentPage = lastPage.page;
      const totalPage = lastPage.totalPage;
      return currentPage + 1 < totalPage ? currentPage + 1 : undefined;
    },
    initialPageParam: 0,
  });

export { useFetchNotices };
