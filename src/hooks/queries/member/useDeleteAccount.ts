import { Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { deleteAccount } from 'services/rest/member';
import { MEMBER_QUERY_KEY } from 'constants/queries';
import { useAuthStore } from 'stores/auth';
import type { deleteAccountResponseSchemeType } from 'types/member/scheme/api';

const useDeleteAccount = () => {
  const { setIsLoggedIn, setTokenInfo, setMemberId, removeTokenInfo } = useAuthStore(
    ({ actions: { setIsLoggedIn, setTokenInfo, setMemberId, removeTokenInfo } }) => ({
      setIsLoggedIn,
      setTokenInfo,
      setMemberId,
      removeTokenInfo,
    }),
  );

  return useMutation<deleteAccountResponseSchemeType, AxiosError, { memberId: string }>({
    mutationKey: MEMBER_QUERY_KEY.DELETE_ACCOUNT,
    mutationFn: payload => deleteAccount(payload),
    onSuccess: async ({ data }) => {
      console.log('delete success data: ', data);
      removeTokenInfo();
      setIsLoggedIn(false);
      setTokenInfo({ access: null, refresh: null });
      setMemberId(null);
    },
    onError: e => {
      console.error('회원탈퇴 실패 ', e.response?.data);
      Alert.alert('회원탈퇴에 실패했습니다.');
    },
  });
};

export { useDeleteAccount };
