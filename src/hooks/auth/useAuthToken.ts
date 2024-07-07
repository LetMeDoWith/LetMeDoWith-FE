import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { useAuthStore } from 'stores/auth';
import { useGetTokenQuery } from 'hooks/queries/auth/useGetTokenQuery';
import type { ProviderEnumType } from 'types/auth/scheme/enum';

/**
 * 토큰에 대해 유효성 검사를 하는 custom hook
 */
const useAuthToken = (provider: ProviderEnumType): [string, Dispatch<SetStateAction<string>>] => {
  const { getTokenInfo, setTokenInfo, setIsLoggedIn, setIsNeedSignUp } = useAuthStore();
  const [idToken, setIdToken] = useState('');

  const { data } = useGetTokenQuery({ provider, idToken }, { enabled: !!idToken });

  // 스토리지에 있는 토큰 유효성 검사
  useEffect(() => {
    getTokenInfo();
  }, [getTokenInfo]);

  useEffect(() => {
    if (!data) return;

    // 회원 가입이 필요한 경우
    if (data.signupToken) {
      setTokenInfo({ signup: data.signupToken });
      setIsLoggedIn(true);
      setIsNeedSignUp(true);
      setIdToken('');
      return;
    }

    if (!data.atk || !data.rtk) return;

    // 회원가입이 완료 되었을 경우
    setTokenInfo({ access: data.atk, refresh: data.rtk });
    setIsNeedSignUp(false);
    setIdToken('');
  }, [data, setIsLoggedIn, setIsNeedSignUp, setTokenInfo]);

  return [idToken, setIdToken];
};

export { useAuthToken };
