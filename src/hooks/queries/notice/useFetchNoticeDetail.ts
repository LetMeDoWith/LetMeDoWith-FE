import type { ApiError } from 'services/apiClient';
import { useQuery } from '@tanstack/react-query';

import { NOTICE_QUERY_KEY } from 'constants/queries';
import { fetchNoticeDetail } from 'services/rest/notice';
import type { fetchNoticeDetailResponseSchemeType } from 'types/notice/scheme/api';

const useFetchNoticeDetail = (noticeId: number) =>
  useQuery<fetchNoticeDetailResponseSchemeType, ApiError>({
    queryKey: [...NOTICE_QUERY_KEY.DETAIL, noticeId],
    queryFn: () => fetchNoticeDetail(noticeId),
  });

export { useFetchNoticeDetail };
