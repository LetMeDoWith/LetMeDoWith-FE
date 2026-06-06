import type { ApiError } from 'services/apiClient';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';

import { NOTIFICATION_QUERY_KEY } from 'constants/queries';
import { DEFAULT_PAGE_SIZE } from 'constants/shared';
import { fetchNotifications } from 'services/rest/notification';
import type { fetchNotificationsResponseSchemeType } from 'types/notification/scheme/api';

type NotificationType = 'NORMAL' | 'EVENT';

const useFetchNotifications = (type: NotificationType) =>
  useInfiniteQuery<
    fetchNotificationsResponseSchemeType,
    ApiError,
    InfiniteData<fetchNotificationsResponseSchemeType, number>,
    readonly (string | NotificationType)[],
    number
  >({
    queryKey: [...NOTIFICATION_QUERY_KEY.LIST, type],
    queryFn: ({ pageParam }) => fetchNotifications({ type, page: pageParam, size: DEFAULT_PAGE_SIZE }),
    getNextPageParam: lastPage => {
      const currentPage = lastPage.page;
      const totalPage = lastPage.totalPage;
      return currentPage + 1 < totalPage ? currentPage + 1 : undefined;
    },
    initialPageParam: 0,
    // 5분간 캐시 유지 (헤더 → 알림 스크린 진입 시 중복 요청 방지)
    // 알림 확인(confirm) 시 invalidateQueries로 즉시 갱신
    staleTime: 5 * 60 * 1000,
  });

export { useFetchNotifications };
