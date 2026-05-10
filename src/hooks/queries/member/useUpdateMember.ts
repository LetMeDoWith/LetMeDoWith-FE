import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import type { ApiError } from 'services/apiClient';

import { MEMBER_QUERY_KEY } from 'constants/queries';
import { updateMember } from 'services/rest/member';
import type { EmptyDataResponseSchemeType } from 'types/shared/scheme/api';
import type { updateMemberRequestSchemeType } from 'types/member/scheme/api';

const useUpdateMember = (
  options?: Omit<
    UseMutationOptions<EmptyDataResponseSchemeType, ApiError, updateMemberRequestSchemeType>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<EmptyDataResponseSchemeType, ApiError, updateMemberRequestSchemeType>({
    ...options,
    mutationFn: payload => updateMember(payload),
    onSuccess: async (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: MEMBER_QUERY_KEY.MY_DOWITH });
      await options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('회원정보 수정 실패:', error);
      options?.onError?.(error, variables, context);
    },
  });
};

export { useUpdateMember };
