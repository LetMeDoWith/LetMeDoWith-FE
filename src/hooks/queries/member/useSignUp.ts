import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { signUp } from 'services/rest/member';
import { MEMBER_QUERY_KEY } from 'constants/queries';
import type { signUpRequestSchemeType, signUpResponseSchemeType } from 'types/member/scheme/api';

const useSignUp = () =>
  useMutation<signUpResponseSchemeType, AxiosError, signUpRequestSchemeType>({
    mutationKey: MEMBER_QUERY_KEY.SIGN_UP,
    mutationFn: payload => signUp(payload),
  });

export { useSignUp };
