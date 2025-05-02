import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import type { fetchTokenRequestSchemeType, fetchTokenResponseSchemeType } from 'types/auth/scheme/api';
import { fetchToken } from 'services/rest/auth';
import { AUTH_QUERY_KEY } from 'constants/queries';

/**
 * 토큰 발급 Mutation Query Hook
 * @param payload provider(로그인 기능 제공자), idToken(사용자의 정보를 담고 있는 토큰)
 */
const useFetchTokenQuery = () =>
  useMutation<fetchTokenResponseSchemeType, AxiosError, fetchTokenRequestSchemeType>({
    mutationKey: AUTH_QUERY_KEY.FETCH_TOKEN,
    mutationFn: payload => fetchToken(payload),
  });

export { useFetchTokenQuery };
