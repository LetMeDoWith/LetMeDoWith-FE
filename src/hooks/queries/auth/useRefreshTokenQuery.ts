import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiError } from 'services/apiClient';

import type { refreshTokenRequestSchemeType, refreshTokenResponseSchemeType } from 'types/auth/scheme/api';
import { refreshToken } from 'services/rest/auth';
import { AUTH_QUERY_KEY } from 'constants/queries';
import { useStore } from 'stores/index';
import { SESSION_EXPIRED_STATUS_CODES } from 'constants/shared';
import { useDialog } from 'components/common/Dialog/Provider';
import { refetchFailedQueries } from 'utils/error';

/**
 * 토큰 재발급 Mutation Query Hook
 */
const useRefreshTokenQuery = () => {
  const queryClient = useQueryClient();
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

      /* 만료된 토큰(E302)으로 실패했던 조회를 새 토큰으로 다시 받는다 — 첫 로딩 실패 화면이 빈 채로 남지 않게 */
      refetchFailedQueries(queryClient);
    },
    onError: e => {
      const errorCode = e.response?.data.statusCode;
      /*
       * 재발급이 불가능한 에러(RTK 미존재 E303, 소유자 불일치 E306~E308)면 상태를 초기화하고 로그인으로 보낸다.
       * E303은 재시도해도 복구되지 않는다 — 처리하지 않으면 재로그인 안내 없이 남는다.
       */
      if (errorCode && SESSION_EXPIRED_STATUS_CODES.includes(errorCode)) {
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
