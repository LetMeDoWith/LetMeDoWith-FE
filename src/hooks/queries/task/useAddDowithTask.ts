import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiError } from 'services/apiClient';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { TASK_QUERY_KEY } from 'constants/queries';
import { addDowithTask } from 'services/rest/task';
import type { addTaskRequestSchemeType } from 'types/task/scheme/api';
import type { RootStackParamList } from 'types/shared';

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
    },
  });
};

export { useAddDowithTask };
