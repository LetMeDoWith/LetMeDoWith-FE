import { useQuery } from '@tanstack/react-query';

import type { fetchTokenRequestSchemeType } from 'types/auth/scheme/api';
import { fetchToken } from 'services/rest/auth';
import { AUTH_QUERY_KEY } from 'constants/queries';

/**
 * 토큰 발급 query hook
 * @param payload provider(로그인 기능 제공자), idToken(사용자의 정보를 담고 있는 토큰)
 * @param options enabled(query hook 발동 조건)
 */
const useFetchTokenQuery = (payload: fetchTokenRequestSchemeType, options?: { enabled: boolean }) =>
  useQuery({
    queryKey: AUTH_QUERY_KEY.FETCH_TOKEN,
    queryFn: () => fetchToken(payload),
    select: data => data.data,
    ...options,
  });

export { useFetchTokenQuery };
