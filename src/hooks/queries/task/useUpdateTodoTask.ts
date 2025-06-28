import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { TASK_QUERY_KEY } from 'constants/queries';
import { updateStatusTodoTask } from 'services/rest/task';
import type { updateTodoTaskResponseSchemeType } from 'types/task/scheme/api';
import type { TaskStatusEnumType } from 'types/task/scheme/enum';

interface Props {
  year: number;
  month: number;
}

const useUpdateTodoTask = ({ year, month }: Props) => {
  const queryClient = useQueryClient();

  return useMutation<updateTodoTaskResponseSchemeType, AxiosError, { id: number; status: TaskStatusEnumType }>({
    mutationKey: TASK_QUERY_KEY.UPDATE_TODO_STATUS,
    mutationFn: payload => updateStatusTodoTask(payload),
    onSuccess: async ({ data }) => {
      console.log('투두 테스크 상태 업데이트 요청 성공!: ', data);
      queryClient.invalidateQueries({ queryKey: [...TASK_QUERY_KEY.LIST, year, month] });
    },
    onError: e => {
      console.error('투두 테스크 상태 업데이트 실패 ', e.response?.data);
    },
  });
};

export { useUpdateTodoTask };
