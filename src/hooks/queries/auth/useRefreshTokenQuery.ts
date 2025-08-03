import { Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import type { refreshTokenRequestSchemeType, refreshTokenResponseSchemeType } from 'types/auth/scheme/api';
import { refreshToken } from 'services/rest/auth';
import { AUTH_QUERY_KEY } from 'constants/queries';
import { useAuthStore } from 'stores/auth';

/**
 * 토큰 재발급 Mutation Query Hook
 */
const useRefreshTokenQuery = () => {
  const { setTokenInfo, setIsNeedSignUp, setIsLoggedIn, setIsNeedRefreshToken, setMemberId } = useAuthStore(
    ({ actions: { setTokenInfo, setIsNeedSignUp, setIsLoggedIn, setIsNeedRefreshToken, setMemberId } }) => ({
      setTokenInfo,
      setIsNeedSignUp,
      setIsLoggedIn,
      setIsNeedRefreshToken,
      setMemberId,
    }),
  );

  return useMutation<refreshTokenResponseSchemeType, AxiosError, refreshTokenRequestSchemeType>({
    mutationKey: AUTH_QUERY_KEY.REFRESH_TOKEN,
    mutationFn: payload => refreshToken(payload),
    onSuccess: ({ data }) => {
      if (!data.accessToken || !data.refreshToken || !data.memberId) {
        return;
      }

      // 토큰 재발급이 완료 되었을 경우
      setTokenInfo({ access: data.accessToken, refresh: data.refreshToken });
      setIsLoggedIn(true);
      setIsNeedRefreshToken(false);
      setIsNeedSignUp(false);
      setMemberId(data.memberId);
    },
    onError: e => {
      console.error('토큰 재발급 실패 ', e.response?.data);
      Alert.alert('토큰 재발급에 실패했습니다.');
    },
  });
};

export { useRefreshTokenQuery };
