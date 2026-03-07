import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { TASK_QUERY_KEY } from 'constants/queries';
import { unLikeDowithTask } from 'services/rest/task';
import type {
  unLikeDowithTaskResponseSchemeType,
  fetchSuccessDowithTasksResponseSchemeType,
} from 'types/task/scheme/api';

const useUnLikeDowithTask = () => {
  const queryClient = useQueryClient();

  return useMutation<unLikeDowithTaskResponseSchemeType, AxiosError, number>({
    mutationFn: dowithTaskId => unLikeDowithTask(dowithTaskId),
    onSuccess: (res, dowithTaskId) => {
      queryClient.setQueriesData<fetchSuccessDowithTasksResponseSchemeType>(
        { queryKey: TASK_QUERY_KEY.SUCCESS_DOWITH_TASKS },
        prev => {
          if (!prev) {
            return prev;
          }
          return {
            ...prev,
            data: {
              successDowithTasks: prev.data.successDowithTasks.map(task =>
                task.id === dowithTaskId ? { ...task, isLiked: false, likeCount: res.data.likeCount } : task,
              ),
            },
          };
        },
      );
    },
  });
};

export { useUnLikeDowithTask };
