import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiError } from 'services/apiClient';

import { TASK_QUERY_KEY } from 'constants/queries';
import { createDowithFeedback } from 'services/rest/feedback';
import { logEvent, toAnalyticsId } from 'utils/analytics';

interface SendFeedbackParams {
  taskId: number;
  templateId: number;
}

const useSendFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, SendFeedbackParams>({
    mutationFn: ({ taskId, templateId }: SendFeedbackParams) =>
      createDowithFeedback({ dowithTaskId: taskId, taskFeedbackTemplateId: templateId }),
    onSuccess: (_, { templateId }) => {
      logEvent('feedback_complete', { template_id: toAnalyticsId(templateId) });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY.FEEDBACK_AVAILABLE_DOWITH_TASKS });
    },
  });
};

export { useSendFeedback };
