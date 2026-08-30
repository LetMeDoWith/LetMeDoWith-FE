import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiError } from 'services/apiClient';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { TASK_QUERY_KEY } from 'constants/queries';
import { addDowithTask } from 'services/rest/task';
import type { addTaskRequestSchemeType } from 'types/task/scheme/api';
import type { RootStackParamList } from 'types/shared';
import { useStore } from 'stores/index';

const useAddDowithTask = () => {
  const queryClient = useQueryClient();
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList, 'TASK_FORM'>>();

  return useMutation<undefined, ApiError, addTaskRequestSchemeType>({
    mutationKey: TASK_QUERY_KEY.ADD_DOWITH,
    mutationFn: payload => addDowithTask(payload),
    onSuccess: () => {
      console.log('두윗 등록 성공! ');
      navigate('HOME');
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY.LIST });

      /*
       * 첫 두윗을 등록하고 목록으로 돌아온 이 시점에만 코치마크를 예약한다.
       * getState로 읽어야 등록 시점의 최신 값을 본다.
       */
      const { hasSeenDowithOnboarding, onboardingActions } = useStore.getState();
      if (!hasSeenDowithOnboarding) {
        onboardingActions.requestDowithOnboarding();
      }
    },
  });
};

export { useAddDowithTask };
