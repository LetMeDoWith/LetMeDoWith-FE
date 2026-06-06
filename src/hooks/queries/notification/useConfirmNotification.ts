import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ApiError } from 'services/apiClient';
import { NOTIFICATION_QUERY_KEY } from 'constants/queries';
import { confirmNotification } from 'services/rest/notification';

const useConfirmNotification = () => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: (notificationId: number) => confirmNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEY.LIST });
    },
  });
};

export { useConfirmNotification };
