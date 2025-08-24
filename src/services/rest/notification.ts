import { apiClient } from 'services/apiClient';
import { NOTIFICATION_API } from 'services/urls';
import type { addNotificationTokenRequestSchemeType } from 'types/notification/scheme/api';

const addNotificationToken = async (payload: addNotificationTokenRequestSchemeType): Promise<undefined> => {
  try {
    const result = await apiClient.post<undefined>(NOTIFICATION_API.ADD_TOKEN, payload);
    return result.data;
  } catch (e) {
    throw e;
  }
};

export { addNotificationToken };
