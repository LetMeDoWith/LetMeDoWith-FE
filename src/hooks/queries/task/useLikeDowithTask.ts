import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { TASK_QUERY_KEY } from 'constants/queries';
import { likeDowithTask } from 'services/rest/task';
import type {
  fetchSuccessDowithTasksResponseSchemeType,
  likeDowithTaskResponseSchemeType,
} from 'types/task/scheme/api';

const useLikeDowithTask = () => {
  const queryClient = useQueryClient();

  return useMutation<likeDowithTaskResponseSchemeType, AxiosError, number>({
    mutationFn: dowithTaskId => likeDowithTask(dowithTaskId),
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
                task.id === dowithTaskId
                  ? // TODO: 좋아요 취소 API 연동 시 isAlreadyLiked 활용
                    { ...task, isLiked: true, likeCount: res.data.likeCount }
                  : task,
              ),
            },
          };
        },
      );
    },
  });
};

export { useLikeDowithTask };
