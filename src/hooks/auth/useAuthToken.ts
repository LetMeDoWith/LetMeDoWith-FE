import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import type { ProviderEnumType } from 'types/auth/scheme/enum';
import { useAuthStore } from 'stores/auth';
import { useFetchTokenQuery } from 'hooks/queries/auth/useFetchTokenQuery';
import { useRefreshTokenQuery } from 'hooks/queries/auth/useRefreshTokenQuery';

/**
 * 토큰에 대해 유효성 검사를 하는 custom hook
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
  } = useAuthStore();
  const [idToken, setIdToken] = useState<string | null>(null);

  const { data: fetchTokenData } = useFetchTokenQuery({ provider, idToken: idToken || '' }, { enabled: !!idToken });
  const { data: refreshTokenData } = useRefreshTokenQuery(
    { refreshToken: tokenInfo.refresh?.token || '' },
    { enabled: isNeedRefreshToken },
  );

  // 스토리지에 있는 토큰 유효성 검사
  useEffect(() => {
    validateTokenInfo();
  }, [validateTokenInfo]);

  // 토큰 발급 로직 수행
  useEffect(() => {
    if (!fetchTokenData) return;

    // 회원 가입이 필요한 경우
    if (fetchTokenData.signupToken) {
      setTokenInfo({ signup: fetchTokenData.signupToken });
      setIsLoggedIn(true);
      setIsNeedSignUp(true);
      setIdToken(null);
      return;
    }

    if (!fetchTokenData.atk || !fetchTokenData.rtk) return;

    // 회원가입이 완료 되었을 경우
    setTokenInfo({ access: fetchTokenData.atk, refresh: fetchTokenData.rtk });
    setIsNeedSignUp(false);
    setIdToken(null);
  }, [fetchTokenData, setIsLoggedIn, setIsNeedSignUp, setTokenInfo]);

  // 토큰 재발급 로직 수행
  useEffect(() => {
    if (!refreshTokenData || !refreshTokenData.atk || !refreshTokenData.rtk) return;

    // 토큰 재발급이 완료 되었을 경우
    setTokenInfo({ access: refreshTokenData.atk, refresh: refreshTokenData.rtk });
    setIsLoggedIn(true);
    setIsNeedRefreshToken(false);
    setIsNeedSignUp(false);
    setIdToken(null);
  }, [refreshTokenData, setIsLoggedIn, setIsNeedRefreshToken, setIsNeedSignUp, setTokenInfo]);

  return [idToken, setIdToken];
};

export { useAuthToken };
