import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { TASK_QUERY_KEY } from 'constants/queries';
import { createDowithFeedback } from 'services/rest/feedback';

interface SendFeedbackParams {
  taskId: number;
  templateId: number;
}

const useSendFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError, SendFeedbackParams>({
    mutationFn: ({ taskId, templateId }: SendFeedbackParams) =>
      createDowithFeedback({ dowithTaskId: taskId, taskFeedbackTemplateId: templateId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY.FEEDBACK_AVAILABLE_DOWITH_TASKS });
    },
  });
};

export { useSendFeedback };
