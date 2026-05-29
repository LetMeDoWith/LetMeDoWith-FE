import { apiClient } from 'services/apiClient';
import { NOTIFICATION_API } from 'services/urls';
import type { PageRequestSchemeType } from 'types/shared/scheme/api';
import type {
  addNotificationTokenRequestSchemeType,
  fetchNotificationsResponseSchemeType,
} from 'types/notification/scheme/api';

const addNotificationToken = async (payload: addNotificationTokenRequestSchemeType): Promise<undefined> => {
  try {
    const result = await apiClient.post<undefined>(NOTIFICATION_API.ADD_TOKEN, payload);
    return result.data;
  } catch (e) {
    throw e;
  }
};

interface FetchNotificationsParams extends PageRequestSchemeType {
  type: 'NORMAL' | 'EVENT';
}

const fetchNotifications = async (params: FetchNotificationsParams): Promise<fetchNotificationsResponseSchemeType> => {
  try {
    const result = await apiClient.get<fetchNotificationsResponseSchemeType>(NOTIFICATION_API.LIST, { params });
    return result.data;
  } catch (e) {
    throw e;
  }
};

export { addNotificationToken, fetchNotifications };
