import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { TASK_QUERY_KEY } from 'constants/queries';
import { updateTodoTask } from 'services/rest/task';
import type { updateTaskRequestSchemeType } from 'types/task/scheme/api';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from 'types/shared';

const useUpdateTodoTask = (id: number) => {
  const queryClient = useQueryClient();
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList, 'TASK_FORM'>>();

  return useMutation<string, AxiosError, updateTaskRequestSchemeType>({
    mutationKey: TASK_QUERY_KEY.UPDATE_TODO,
    mutationFn: payload => updateTodoTask({ id, payload }),
    onSuccess: () => {
      console.log('투두 업데이트 성공! ');
      navigate('HOME');
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY.LIST });
    },
  });
};

export { useUpdateTodoTask };
