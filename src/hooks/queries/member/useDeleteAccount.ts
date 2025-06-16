import { Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { deleteAccount } from 'services/rest/member';
import { MEMBER_QUERY_KEY } from 'constants/queries';
import { useAuthStore } from 'stores/auth';

const useDeleteAccount = () => {
  const { setIsLoggedIn, setTokenInfo, setMemberId } = useAuthStore(
    ({ actions: { setIsLoggedIn, setTokenInfo, setMemberId } }) => ({
      setIsLoggedIn,
      setTokenInfo,
      setMemberId,
    }),
  );

  return useMutation<any, AxiosError, any>({
    mutationKey: MEMBER_QUERY_KEY.DELETE_ACCOUNT,
    mutationFn: payload => deleteAccount(payload),
    onSuccess: ({ data }) => {
      console.log('delete success data: ', data);
      setIsLoggedIn(false);
      setTokenInfo({ access: null, refresh: null });
      setMemberId(null);
      // TODO: 스토리지 초기화 필요
    },
    onError: e => {
      console.error('회원탈퇴 실패 ', e.response?.data);
      Alert.alert('회원탈퇴에 실패했습니다.');
    },
  });
};

export { useDeleteAccount };
