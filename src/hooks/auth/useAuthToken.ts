import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import type { ProviderEnumType } from 'types/auth/scheme/enum';
import { useAuthStore } from 'stores/auth';
import { useFetchTokenQuery } from 'hooks/queries/auth/useFetchTokenQuery';
import { useRefreshTokenQuery } from 'hooks/queries/auth/useRefreshTokenQuery';

/**
 * 토큰에 대해 유효성 검사를 하는 custom hook
 * @param provider 인증 공급자 (GOOGLE | KAKAO | APPLE)
 */
const useAuthToken = (provider: ProviderEnumType): [string | null, Dispatch<SetStateAction<string | null>>] => {
  const {
    validateTokenInfo,
    tokenInfo,
    setTokenInfo,
    setIsLoggedIn,
    setIsNeedSignUp,
    isNeedRefreshToken,
    setIsNeedRefreshToken,
  } = useAuthStore(
    ({
      tokenInfo,
      isNeedRefreshToken,
      actions: { validateTokenInfo, setTokenInfo, setIsLoggedIn, setIsNeedSignUp, setIsNeedRefreshToken },
    }) => ({
      validateTokenInfo,
      tokenInfo,
      setTokenInfo,
      setIsLoggedIn,
      setIsNeedSignUp,
      isNeedRefreshToken,
      setIsNeedRefreshToken,
    }),
  );
  const [idToken, setIdToken] = useState<string | null>(null);

  const { mutate: mutateFetchToken } = useFetchTokenQuery();
  const { mutate: mutateRefreshToken } = useRefreshTokenQuery();

  // 스토리지에 있는 토큰 유효성 검사
  useEffect(() => {
    validateTokenInfo();
  }, [validateTokenInfo]);

  // 토큰 발급 로직 수행
  useEffect(() => {
    if (!idToken) {
      return;
    }

    mutateFetchToken(
      { provider, idToken },
      {
        onSuccess: ({ data }) => {
          setIsLoggedIn(true);

          // 회원 가입이 필요한 경우
          if (data.signupToken) {
            setIsNeedSignUp(true);
            setTokenInfo({ signup: data.signupToken });
            return;
          }

          if (!data.atk || !data.rtk) {
            return;
          }

          // 회원가입이 완료 되었을 경우
          setIsNeedSignUp(false);
          setTokenInfo({ access: data.atk, refresh: data.rtk });
        },
        onError: e => {
          console.error('토큰 발급 실패 ', e.response?.data);
          Alert.alert('토큰 발급에 실패했습니다.');
        },
        onSettled: () => {
          setIdToken(null);
        },
      },
    );
  }, [idToken, setIsLoggedIn, setIsNeedSignUp, setTokenInfo]);

  // 토큰 재발급 로직 수행
  useEffect(() => {
    if (!tokenInfo.refresh?.token) {
      return;
    }

    mutateRefreshToken(
      { refreshToken: tokenInfo.refresh.token },
      {
        onSuccess: ({ data }) => {
          if (!data.atk || !data.rtk) {
            return;
          }
          // 토큰 재발급이 완료 되었을 경우
          setTokenInfo({ access: data.atk, refresh: data.rtk });
          setIsLoggedIn(true);
          setIsNeedRefreshToken(false);
          setIsNeedSignUp(false);
        },
        onError: e => {
          console.error('토큰 재발급 실패 ', e.response?.data);
          Alert.alert('토큰 재발급에 실패했습니다.');
        },
        onSettled: () => {
          setIdToken(null);
        },
      },
    );
  }, [tokenInfo.refresh?.token, setIsLoggedIn, setIsNeedRefreshToken, setIsNeedSignUp, setTokenInfo]);

  return [idToken, setIdToken];
};

export { useAuthToken };
