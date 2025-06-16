import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { AppState } from 'react-native';

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
    tokenInfo,
    isNeedRefreshToken,
    isHydrated,
    setTokenInfo,
    setIsLoggedIn,
    setIsNeedSignUp,
    setIsNeedRefreshToken,
  } = useAuthStore(
    ({
      tokenInfo,
      isNeedRefreshToken,
      isHydrated,
      actions: { setTokenInfo, setIsLoggedIn, setIsNeedSignUp, setIsNeedRefreshToken },
    }) => ({
      tokenInfo,
      isNeedRefreshToken,
      isHydrated,
      setTokenInfo,
      setIsLoggedIn,
      setIsNeedSignUp,
      setIsNeedRefreshToken,
    }),
  );
  const [idToken, setIdToken] = useState<string | null>(null);

  const { mutate: mutateFetchToken } = useFetchTokenQuery();
  const { mutate: mutateRefreshToken } = useRefreshTokenQuery();

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

  // 토큰 재발급 로직 수행
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      // Foreground 복귀시마다 토큰 재발급 로직 수행여부 체크
      if (state === 'active') {
        if (isHydrated && isNeedRefreshToken && tokenInfo.refresh?.token) {
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
            },
          );
        }
      }

      return () => subscription.remove();
    });
  }, [
    tokenInfo,
    isNeedRefreshToken,
    isHydrated,
    setIsLoggedIn,
    setIsNeedRefreshToken,
    setIsNeedSignUp,
    setTokenInfo,
    mutateRefreshToken,
  ]);

  return [idToken, setIdToken];
};

export { useAuthToken };
