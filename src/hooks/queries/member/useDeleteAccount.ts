import { Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { deleteAccount } from 'services/rest/member';
import { MEMBER_QUERY_KEY } from 'constants/queries';
import { INITIAL_STORAGE_VALUE, useAuthStore } from 'stores/auth';
import { secureStorage, STORAGE_KEY } from 'stores/secure';
import type { deleteAccountResponseSchemeType } from 'types/member/scheme/api';

const useDeleteAccount = () => {
  const { setIsLoggedIn, setTokenInfo, setMemberId } = useAuthStore(
    ({ actions: { setIsLoggedIn, setTokenInfo, setMemberId } }) => ({
      setIsLoggedIn,
      setTokenInfo,
      setMemberId,
    }),
  );

  return useMutation<deleteAccountResponseSchemeType, AxiosError, { memberId: string }>({
    mutationKey: MEMBER_QUERY_KEY.DELETE_ACCOUNT,
    mutationFn: payload => deleteAccount(payload),
    onSuccess: async ({ data }) => {
      console.log('delete success data: ', data);
      setIsLoggedIn(false);
      setTokenInfo({ access: null, refresh: null });
      setMemberId(null);

      try {
        await secureStorage().setItem(STORAGE_KEY.AUTH_INFO, JSON.stringify(INITIAL_STORAGE_VALUE));
      } catch (e) {
        Alert.alert('스토리지 초기화에 실패했습니다.');
        throw e;
      }
    },
    onError: e => {
      console.error('회원탈퇴 실패 ', e.response?.data);
      Alert.alert('회원탈퇴에 실패했습니다.');
    },
  });
};

export { useDeleteAccount };
