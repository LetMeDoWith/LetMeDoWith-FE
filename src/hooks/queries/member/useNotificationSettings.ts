import { useMutation } from '@tanstack/react-query';
import type { ApiError } from 'services/apiClient';

import { updateNotificationSettings } from 'services/rest/member';
import type { notificationSettingsRequestSchemeType } from 'types/member/scheme/api';
import type { EmptyDataResponseSchemeType } from 'types/shared/scheme/api';

const useNotificationSettings = () =>
  useMutation<EmptyDataResponseSchemeType, ApiError, notificationSettingsRequestSchemeType>({
    mutationFn: payload => updateNotificationSettings(payload),
    onSuccess: data => {
      console.log('알림 설정 업데이트 완료!', data);
    },
  });

export { useNotificationSettings };
