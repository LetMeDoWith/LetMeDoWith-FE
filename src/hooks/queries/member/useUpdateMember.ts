import { Alert } from 'react-native';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { updateMember } from 'services/rest/member';
import type { EmptyDataResponseSchemeType } from 'types/shared/scheme/api';
import type { updateMemberRequestSchemeType } from 'types/member/scheme/api';

const useUpdateMember = (
  options?: Omit<
    UseMutationOptions<EmptyDataResponseSchemeType, AxiosError, updateMemberRequestSchemeType>,
    'mutationFn'
  >,
) => {
  return useMutation<EmptyDataResponseSchemeType, AxiosError, updateMemberRequestSchemeType>({
    mutationFn: payload => updateMember(payload),
    onSuccess: async (data, variables, context) => {
      console.log('회원정보 수정 성공!: ', data);
      Alert.alert('회원 정보 수정을 성공하였습니다.');
      // TODO: 회원정보 조회 API 쿼리 무효화 적용

      await options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // 기본 에러 처리
      console.error('회원정보 수정 실패:', error);
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export { useUpdateMember };
