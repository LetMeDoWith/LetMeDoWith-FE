import { Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { deleteAccount } from 'services/rest/member';
import { MEMBER_QUERY_KEY } from 'constants/queries';
import { useStore } from 'stores/index';
import type { deleteAccountResponseSchemeType } from 'types/member/scheme/api';

const useDeleteAccount = () => {
  const { initAuthInfo } = useStore(({ authActions: { initAuthInfo } }) => ({
    initAuthInfo,
  }));

  return useMutation<deleteAccountResponseSchemeType, AxiosError>({
    mutationKey: MEMBER_QUERY_KEY.DELETE_ACCOUNT,
    mutationFn: deleteAccount,
    onSuccess: async ({ data }) => {
      console.log('delete success data: ', data);
      initAuthInfo();
    },
    onError: e => {
      console.error('회원탈퇴 실패 ', e.response?.data);
      Alert.alert('회원탈퇴에 실패했습니다.');
    },
  });
};

export { useDeleteAccount };
