import { useMutation } from '@tanstack/react-query';
import type { ApiError } from 'services/apiClient';

import type { refreshTokenRequestSchemeType, refreshTokenResponseSchemeType } from 'types/auth/scheme/api';
import { refreshToken } from 'services/rest/auth';
import { AUTH_QUERY_KEY } from 'constants/queries';
import { useStore } from 'stores/index';
import { ErrorStatusCodeEnum } from 'schemes/shared/enum';
import { useDialog } from 'components/common/Dialog/Provider';

/**
 * 토큰 재발급 Mutation Query Hook
 */
const useRefreshTokenQuery = () => {
  const { showDialog, hideDialog } = useDialog();
  const { initAuthInfo, setTokenInfo, setIsNeedSignUp, setIsLoggedIn, setIsNeedRefreshToken, setMemberId } = useStore(
    ({
      authActions: { initAuthInfo, setTokenInfo, setIsNeedSignUp, setIsLoggedIn, setIsNeedRefreshToken, setMemberId },
    }) => ({
      initAuthInfo,
      setTokenInfo,
      setIsNeedSignUp,
      setIsLoggedIn,
      setIsNeedRefreshToken,
      setMemberId,
    }),
  );

  return useMutation<refreshTokenResponseSchemeType, ApiError, refreshTokenRequestSchemeType>({
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
      const errorCode = e.response?.data.statusCode;
      // 재발급 토큰이 유효하지 않은 에러 발생시, 상태 초기화
      if (
        errorCode === ErrorStatusCodeEnum.enum.E306 ||
        errorCode === ErrorStatusCodeEnum.enum.E307 ||
        errorCode === ErrorStatusCodeEnum.enum.E308
      ) {
        // 앱 foreground 복귀 시 만료 처리(App.tsx)와 동일한 Dialog로 통일
        showDialog({
          type: 'ALERT',
          title: '세션 만료',
          content: '세션 정보가 만료되어\n로그인 페이지로 이동합니다.',
          handleAlertButton: hideDialog,
        });
        initAuthInfo();
      }
    },
  });
};

export { useRefreshTokenQuery };
