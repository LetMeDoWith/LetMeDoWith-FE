import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { TASK_QUERY_KEY } from 'constants/queries';
import { createDowithFeedback } from 'services/rest/feedback';
import type { fetchFeedbackAvailableDowithTasksResponseSchemeType, myFeedbackSchemeType } from 'types/task/scheme/api';

interface SendFeedbackParams {
  taskId: number;
  templateId: number;
}

const useSendFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, SendFeedbackParams, fetchFeedbackAvailableDowithTasksResponseSchemeType[]>({
    mutationFn: ({ taskId, templateId }: SendFeedbackParams) =>
      createDowithFeedback({ dowithTaskId: taskId, taskFeedbackTemplateId: templateId }),
    onMutate: async ({ taskId, templateId }) => {
      await queryClient.cancelQueries({ queryKey: TASK_QUERY_KEY.FEEDBACK_AVAILABLE_DOWITH_TASKS });

      const previousDataList = queryClient.getQueriesData<fetchFeedbackAvailableDowithTasksResponseSchemeType>({
        queryKey: TASK_QUERY_KEY.FEEDBACK_AVAILABLE_DOWITH_TASKS,
      });

      const newFeedback: myFeedbackSchemeType = {
        templateId,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueriesData<fetchFeedbackAvailableDowithTasksResponseSchemeType>(
        { queryKey: TASK_QUERY_KEY.FEEDBACK_AVAILABLE_DOWITH_TASKS },
        oldData => {
          if (!oldData) {
            return oldData;
          }
          return {
            ...oldData,
            data: {
              ...oldData.data,
              dowithTasks: oldData.data.dowithTasks.map(task =>
                task.id === taskId
                  ? { ...task, myFeedbacks: [...task.myFeedbacks, newFeedback], feedbackCount: task.feedbackCount + 1 }
                  : task,
              ),
            },
          };
        },
      );

      return previousDataList.map(([, data]) => data!);
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      const queryEntries = queryClient.getQueriesData<fetchFeedbackAvailableDowithTasksResponseSchemeType>({
        queryKey: TASK_QUERY_KEY.FEEDBACK_AVAILABLE_DOWITH_TASKS,
      });

      queryEntries.forEach(([key], index) => {
        if (context[index]) {
          queryClient.setQueryData(key, context[index]);
        }
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY.FEEDBACK_AVAILABLE_DOWITH_TASKS });
    },
  });
};

export { useSendFeedback };
