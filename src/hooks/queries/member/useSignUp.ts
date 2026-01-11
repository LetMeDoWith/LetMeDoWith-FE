import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { signUp } from 'services/rest/member';
import { MEMBER_QUERY_KEY } from 'constants/queries';
import { useStore } from 'stores/index';
import type { signUpRequestSchemeType, signUpResponseSchemeType } from 'types/member/scheme/api';

const useSignUp = () => {
  const { setTokenInfo, setIsNeedSignUp, setMemberId } = useStore(
    ({ authActions: { setTokenInfo, setIsNeedSignUp, setMemberId } }) => ({
      setTokenInfo,
      setIsNeedSignUp,
      setMemberId,
    }),
  );

  return useMutation<signUpResponseSchemeType, AxiosError, signUpRequestSchemeType>({
    mutationKey: MEMBER_QUERY_KEY.SIGN_UP,
    mutationFn: payload => signUp(payload),
    onSuccess: ({ data }) => {
      console.log('signup success data: ', data);
      setTokenInfo({ access: data.accessToken, refresh: data.refreshToken, signup: null });
      setMemberId(data.memberId);
      setIsNeedSignUp(false);
    },
    onError: e => {
      console.error(e.response?.data);
    },
  });
};

export { useSignUp };
