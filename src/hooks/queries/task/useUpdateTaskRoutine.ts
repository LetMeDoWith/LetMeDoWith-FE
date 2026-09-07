import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ApiError } from 'services/apiClient';

import { TASK_QUERY_KEY } from 'constants/queries';
import { updateTaskRoutine } from 'services/rest/task';
import type { RootStackParamList, TaskModeType } from 'types/shared';
import type { updateTaskRoutineRequestSchemeType } from 'types/task/scheme/api';

const useUpdateTaskRoutine = ({ mode, id }: { mode: TaskModeType; id: number }) => {
  const queryClient = useQueryClient();
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList, 'TASK_FORM'>>();

  return useMutation<string, ApiError, updateTaskRoutineRequestSchemeType>({
    mutationKey: TASK_QUERY_KEY.UPDATE_ROUTINE,
    mutationFn: payload => updateTaskRoutine({ mode, id, payload }),
    onSuccess: () => {
      const isTodoMode = mode === 'TODO';
      console.log(`${isTodoMode ? '투두' : '도리'} 루틴 수정 성공!`);
      navigate('HOME');
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY.LIST });
    },
  });
};

export { useUpdateTaskRoutine };
