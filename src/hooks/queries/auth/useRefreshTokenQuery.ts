import { useQuery } from '@tanstack/react-query';

import type { refreshTokenRequestSchemeType } from 'types/auth/scheme/api';
import { refreshToken } from 'services/rest/auth';
import { AUTH_QUERY_KEY } from 'constants/queries';

/**
 * 토큰 재발급 query hook
 * @param payload refreshToken: 재발급 토큰
 * @param options enabled(query hook 발동 조건)
 */
const useRefreshTokenQuery = (payload: refreshTokenRequestSchemeType, options?: { enabled: boolean }) =>
  useQuery({
    queryKey: AUTH_QUERY_KEY.REFRESH_TOKEN,
    queryFn: () => refreshToken(payload),
    select: data => data.data,
    ...options,
  });

export { useRefreshTokenQuery };
