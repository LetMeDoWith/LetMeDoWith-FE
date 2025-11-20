import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { TASK_QUERY_KEY } from 'constants/queries';
import { updateTask } from 'services/rest/task';
import type { RootStackParamList, TaskModeType } from 'types/shared';
import type { fetchTaskListResponseSchemeDataType, updateTaskRequestSchemeType } from 'types/task/scheme/api';

const useUpdateTask = ({
  id,
  type,
  mode,
  year,
  month,
}: {
  id: number;
  type: 'EDIT' | 'DELETE';
  mode: TaskModeType;
  year?: number;
  month?: number;
}) => {
  const queryClient = useQueryClient();
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList, 'TASK_FORM'>>();
  const isTodoMode = mode === 'TODO';
  const isEditType = type === 'EDIT';

  return useMutation<string, AxiosError, { payload?: updateTaskRequestSchemeType; withRoutineTask: boolean }>({
    mutationKey: [...TASK_QUERY_KEY.UPDATE, isTodoMode ? 'todo' : 'dowith'],
    mutationFn: ({ payload, withRoutineTask }) =>
      updateTask({ type, id, mode: isTodoMode ? 'TODO' : 'DOWITH', withRoutineTask, payload }),
    onMutate: async () => {
      if (type === 'DELETE') {
        await queryClient.cancelQueries({ queryKey: [...TASK_QUERY_KEY.LIST, year, month] });
        const previousData = queryClient.getQueryData([...TASK_QUERY_KEY.LIST, year, month]);

        queryClient.setQueryData<{ data: fetchTaskListResponseSchemeDataType }>(
          [...TASK_QUERY_KEY.LIST, year, month],
          old => {
            if (!old) {
              return old;
            }

            return {
              ...old,
              data: {
                todoTasks: old.data.todoTasks.filter(task => task.id !== id),
                dowithTasks: old.data.dowithTasks.filter(task => task.id !== id),
              },
            };
          },
        );

        return { previousData };
      }
    },
    onSuccess: (_, { withRoutineTask }) => {
      console.log(
        `${withRoutineTask ? '루틴' : '일반'} ${isTodoMode ? '투두' : '두윗'} ${
          isEditType ? '업데이트' : '삭제'
        } 성공! `,
      );
      if (isEditType) {
        navigate('HOME');
      }
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY.LIST });
    },
  });
};

export { useUpdateTask };
