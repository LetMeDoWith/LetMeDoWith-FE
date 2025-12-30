import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { updateNotificationSettings } from 'services/rest/member';
import type { notificationSettingsRequestSchemeType } from 'types/member/scheme/api';

const useNotificationSettings = () =>
  useMutation<undefined, AxiosError, notificationSettingsRequestSchemeType>({
    mutationFn: payload => updateNotificationSettings(payload),
    onSuccess: data => {
      console.log('알림 설정 업데이트 완료!', data);
    },
  });

export { useNotificationSettings };
