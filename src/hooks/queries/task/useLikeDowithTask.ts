import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { TASK_QUERY_KEY } from 'constants/queries';
import { likeDowithTask } from 'services/rest/task';
import type { likeDowithTaskResponseSchemeType } from 'types/task/scheme/api';

const useLikeDowithTask = () => {
  const queryClient = useQueryClient();

  return useMutation<likeDowithTaskResponseSchemeType, AxiosError, number>({
    mutationFn: dowithTaskId => likeDowithTask(dowithTaskId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY.SUCCESS_DOWITH_TASKS });
    },
  });
};

export { useLikeDowithTask };
