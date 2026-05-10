import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiError } from 'services/apiClient';

import { TASK_QUERY_KEY } from 'constants/queries';
import { unLikeDowithTask } from 'services/rest/task';
import type { unLikeDowithTaskResponseSchemeType } from 'types/task/scheme/api';

const useUnLikeDowithTask = () => {
  const queryClient = useQueryClient();

  return useMutation<unLikeDowithTaskResponseSchemeType, ApiError, number>({
    mutationFn: dowithTaskId => unLikeDowithTask(dowithTaskId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY.SUCCESS_DOWITH_TASKS });
    },
  });
};

export { useUnLikeDowithTask };
