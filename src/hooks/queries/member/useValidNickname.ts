import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { validNickname } from 'services/rest/member';
import { MEMBER_QUERY_KEY } from 'constants/queries';
import type { validNicknameRequestSchemeType, validNicknameResponseSchemeType } from 'types/member/scheme/api';

const useValidNickname = () =>
  useMutation<validNicknameResponseSchemeType, AxiosError, validNicknameRequestSchemeType>({
    mutationKey: MEMBER_QUERY_KEY.VALID_NICKNAME,
    mutationFn: payload => validNickname(payload),
  });

export { useValidNickname };
