import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import type { refreshTokenRequestSchemeType, refreshTokenResponseSchemeType } from 'types/auth/scheme/api';
import { refreshToken } from 'services/rest/auth';
import { AUTH_QUERY_KEY } from 'constants/queries';

/**
 * 토큰 재발급 Mutation Query Hook
 * @param payload refreshToken: 재발급 토큰
 */
const useRefreshTokenQuery = () =>
  useMutation<refreshTokenResponseSchemeType, AxiosError, refreshTokenRequestSchemeType>({
    mutationKey: AUTH_QUERY_KEY.REFRESH_TOKEN,
    mutationFn: payload => refreshToken(payload),
  });

export { useRefreshTokenQuery };
