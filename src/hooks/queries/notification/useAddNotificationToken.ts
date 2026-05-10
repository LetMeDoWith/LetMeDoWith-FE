import { useMutation } from '@tanstack/react-query';
import type { ApiError } from 'services/apiClient';

import { NOTIFICATION_QUERY_KEY } from 'constants/queries';
import { addNotificationToken } from 'services/rest/notification';
import type { addNotificationTokenRequestSchemeType } from 'types/notification/scheme/api';

const useAddNotificationToken = () => {
  return useMutation<undefined, ApiError, addNotificationTokenRequestSchemeType>({
    mutationKey: NOTIFICATION_QUERY_KEY.ADD_TOKEN,
    mutationFn: payload => addNotificationToken(payload),
    onSuccess: () => {
      console.log('알림 토큰 등록 완료');
    },
  });
};

export { useAddNotificationToken };
