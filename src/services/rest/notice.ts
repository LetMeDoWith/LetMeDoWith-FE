import { apiClient } from 'services/apiClient';
import { NOTICE_API } from 'services/urls';
import type { PageRequestSchemeType } from 'types/shared/scheme/api';
import type { fetchNoticesResponseSchemeType, fetchNoticeDetailResponseSchemeType } from 'types/notice/scheme/api';

interface FetchNoticesParams extends PageRequestSchemeType {
  type?: 'NOTICE' | 'EVENT';
}

const fetchNotices = async (params: FetchNoticesParams): Promise<fetchNoticesResponseSchemeType> => {
  try {
    const result = await apiClient.get<fetchNoticesResponseSchemeType>(NOTICE_API.LIST, { params });
    return result.data;
  } catch (e) {
    throw e;
  }
};

const fetchNoticeDetail = async (noticeId: number): Promise<fetchNoticeDetailResponseSchemeType> => {
  try {
    const result = await apiClient.get<fetchNoticeDetailResponseSchemeType>(
      NOTICE_API.DETAIL.replace(':id', String(noticeId)),
    );
    return result.data;
  } catch (e) {
    throw e;
  }
};

export { fetchNotices, fetchNoticeDetail };
