import { Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import type { fetchTokenRequestSchemeType, fetchTokenResponseSchemeType } from 'types/auth/scheme/api';
import { fetchToken } from 'services/rest/auth';
import { AUTH_QUERY_KEY } from 'constants/queries';
import { useStore } from 'stores/index';

/**
 * 토큰 발급 Mutation Query Hook
 */
const useFetchTokenQuery = () => {
  const { setTokenInfo, setIsLoggedIn, setIsNeedSignUp, setMemberId } = useStore(
    ({ authActions: { setTokenInfo, setIsNeedSignUp, setIsLoggedIn, setMemberId } }) => ({
      setTokenInfo,
      setIsLoggedIn,
      setIsNeedSignUp,
      setMemberId,
    }),
  );

  return useMutation<fetchTokenResponseSchemeType, AxiosError, fetchTokenRequestSchemeType>({
    mutationKey: AUTH_QUERY_KEY.FETCH_TOKEN,
    mutationFn: payload => fetchToken(payload),
    onSuccess: ({ data }) => {
      setIsLoggedIn(true);

      // 회원 가입이 필요한 경우
      if (data.signupToken) {
        setIsNeedSignUp(true);
        setTokenInfo({ signup: data.signupToken });
        return;
      }

      if (!data.accessToken || !data.refreshToken || !data.memberId) {
        return;
      }

      // 이미 존재하는 회원일 경우
      setIsNeedSignUp(false);
      setTokenInfo({ access: data.accessToken, refresh: data.refreshToken });
      setMemberId(data.memberId);
    },
    onError: e => {
      console.error('토큰 발급 실패 ', e.response?.data);
      Alert.alert('토큰 발급에 실패했습니다.');
    },
  });
};

export { useFetchTokenQuery };
