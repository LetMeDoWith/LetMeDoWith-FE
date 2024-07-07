import { useQuery } from '@tanstack/react-query';

import { getTokenRequestSchemeType } from 'types/auth/scheme/api';
import { getToken } from 'services/rest/auth';
import { AUTH_QUERY_KEY } from 'constants/queries';

/**
 * 토큰 발급 query hook
 * @param payload provider(로그인 기능 제공자), idToken(사용자의 정보를 담고 있는 토큰)
 * @param options enabled(query hook 발동 조건)
 */
const useGetTokenQuery = (payload: getTokenRequestSchemeType, options?: { enabled: boolean }) => {
  const result = useQuery({
    queryKey: AUTH_QUERY_KEY.GET_TOKEN,
    queryFn: () => getToken(payload),
    select: data => data.data,
    ...options,
  });

  return result;
};

export { useGetTokenQuery };
