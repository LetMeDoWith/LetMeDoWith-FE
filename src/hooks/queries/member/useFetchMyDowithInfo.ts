import type { ApiError } from 'services/apiClient';
import { useQuery } from '@tanstack/react-query';

import { MEMBER_QUERY_KEY } from 'constants/queries';
import { fetchMyDowithInfo } from 'services/rest/member';
import { useStore } from 'stores/index';
import type { myDowithInfoResponseSchemeType } from 'types/member/scheme/api';
import { toThrowOnError, type BoundaryQueryOptions } from 'utils/error';

/*
 * 서버에서 새로 받아 왔을 때만 온보딩 여부 로컬 사본을 맞춘다.
 * 캐시를 읽는 렌더마다 맞추면, 도리 등록 직후 로컬을 true로 바꿔 둔 값을
 * 아직 갱신 전인 캐시(false)가 되돌려 버린다.
 */
const fetchMyDowithInfoWithOnboardingSync = async (): Promise<myDowithInfoResponseSchemeType> => {
  const result = await fetchMyDowithInfo();
  useStore.getState().onboardingActions.setIsOnBoarded(result.data.isOnBoarded);
  return result;
};

const useFetchMyDowithInfo = ({ throwOnError }: BoundaryQueryOptions = {}) =>
  useQuery<myDowithInfoResponseSchemeType, ApiError, myDowithInfoResponseSchemeType['data']>({
    queryKey: MEMBER_QUERY_KEY.MY_DOWITH,
    queryFn: fetchMyDowithInfoWithOnboardingSync,
    select: data => data.data,
    throwOnError: toThrowOnError(throwOnError),
  });

export { useFetchMyDowithInfo };
