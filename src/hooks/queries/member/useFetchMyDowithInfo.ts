import type { ApiError } from 'services/apiClient';
import { useQuery } from '@tanstack/react-query';

import { MEMBER_QUERY_KEY } from 'constants/queries';
import { fetchMyDowithInfo } from 'services/rest/member';
import type { myDowithInfoResponseSchemeType } from 'types/member/scheme/api';

const useFetchMyDowithInfo = () =>
  useQuery<myDowithInfoResponseSchemeType, ApiError, myDowithInfoResponseSchemeType['data']>({
    queryKey: MEMBER_QUERY_KEY.MY_DOWITH,
    queryFn: fetchMyDowithInfo,
    select: data => data.data,
  });

export { useFetchMyDowithInfo };
