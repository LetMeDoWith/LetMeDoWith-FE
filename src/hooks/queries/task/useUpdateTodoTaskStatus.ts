import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiError } from 'services/apiClient';

import { TASK_QUERY_KEY } from 'constants/queries';
import { updateStatusTodoTask } from 'services/rest/task';
import type { updateTodoTaskStatusResponseSchemeType } from 'types/task/scheme/api';
import type { TaskStatusEnumType } from 'types/task/scheme/enum';

interface Props {
  year: number;
  month: number;
}

const useUpdateTodoTaskStatus = ({ year, month }: Props) => {
  const queryClient = useQueryClient();

  return useMutation<updateTodoTaskStatusResponseSchemeType, ApiError, { id: number; status: TaskStatusEnumType }>({
    mutationKey: TASK_QUERY_KEY.UPDATE_TODO_STATUS,
    mutationFn: payload => updateStatusTodoTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...TASK_QUERY_KEY.LIST, year, month] });
    },
  });
};

export { useUpdateTodoTaskStatus };
