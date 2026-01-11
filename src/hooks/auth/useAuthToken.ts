import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import type { ProviderEnumType } from 'types/auth/scheme/enum';
import { useStore } from 'stores/index';
import { useFetchTokenQuery } from 'hooks/queries/auth/useFetchTokenQuery';

/**
 * 토큰에 대해 유효성 검사를 하는 custom hook
 * @param provider 인증 공급자 (GOOGLE | KAKAO | APPLE)
 */
const useAuthToken = (provider: ProviderEnumType): [string | null, Dispatch<SetStateAction<string | null>>] => {
  const { setTokenInfo, setIsLoggedIn, setIsNeedSignUp } = useStore(
    ({ authActions: { setTokenInfo, setIsLoggedIn, setIsNeedSignUp } }) => ({
      setTokenInfo,
      setIsLoggedIn,
      setIsNeedSignUp,
    }),
  );
  const [idToken, setIdToken] = useState<string | null>(null);

  const { mutate: mutateFetchToken } = useFetchTokenQuery();

  // 토큰 발급 로직 수행
  useEffect(() => {
    if (!idToken) {
      return;
    }

    mutateFetchToken(
      { provider, idToken },
      {
        onSettled: () => {
          setIdToken(null);
        },
      },
    );
  }, [idToken, mutateFetchToken, provider, setIsLoggedIn, setIsNeedSignUp, setTokenInfo]);

  return [idToken, setIdToken];
};

export { useAuthToken };
