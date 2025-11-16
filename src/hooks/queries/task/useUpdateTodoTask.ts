import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { TASK_QUERY_KEY } from 'constants/queries';
import { updateTodoTask } from 'services/rest/task';
import type { RootStackParamList } from 'types/shared';
import type { fetchTaskListResponseSchemeDataType, updateTaskRequestSchemeType } from 'types/task/scheme/api';

const useUpdateTodoTask = ({
  id,
  type,
  isRoutineTask,
  year,
  month,
}: {
  id: number;
  type: 'EDIT' | 'DELETE';
  isRoutineTask: boolean;
  year?: number;
  month?: number;
}) => {
  const queryClient = useQueryClient();
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList, 'TASK_FORM'>>();
  const isEditType = type === 'EDIT';

  return useMutation<string, AxiosError, updateTaskRequestSchemeType | undefined>({
    mutationKey: TASK_QUERY_KEY.UPDATE_TODO,
    mutationFn: payload => updateTodoTask({ type, id, isRoutineTask, payload }),
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
    onSuccess: () => {
      console.log(`투두 ${isEditType ? '업데이트' : '삭제'} 성공! `);
      if (isEditType) {
        navigate('HOME');
      }
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY.LIST });
    },
  });
};

export { useUpdateTodoTask };
