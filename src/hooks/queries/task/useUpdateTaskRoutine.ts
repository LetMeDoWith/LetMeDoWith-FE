import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { TASK_QUERY_KEY } from 'constants/queries';
import { updateTaskRoutine } from 'services/rest/task';
import type { TaskModeType } from 'types/shared';
import type { updateTaskRoutineRequestSchemeType } from 'types/task/scheme/api';

const useUpdateTaskRoutine = ({ navigation, mode, id }: { navigation: any; mode: TaskModeType; id: number }) => {
  const queryClient = useQueryClient();
  // TODO: props로 받아지는 navigation 관련된 타입 모두 구체화 필요
  const navigate = navigation?.navigate;

  return useMutation<string, AxiosError, updateTaskRoutineRequestSchemeType>({
    mutationKey: TASK_QUERY_KEY.UPDATE_ROUTINE,
    mutationFn: payload => updateTaskRoutine({ mode, id, payload }),
    onSuccess: () => {
      const isTodoMode = mode === 'TODO';
      console.log(`${isTodoMode ? '투두' : '두윗'} 루틴 수정 성공!`);
      navigate('HOME');
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY.LIST });
    },
  });
};

export { useUpdateTaskRoutine };
