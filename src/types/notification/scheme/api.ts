import { z } from 'zod';

import {
  addNotificationTokenRequestScheme,
  notificationScheme,
  fetchNotificationsResponseScheme,
} from 'schemes/notification/api';

type addNotificationTokenRequestSchemeType = z.infer<typeof addNotificationTokenRequestScheme>;
type notificationSchemeType = z.infer<typeof notificationScheme>;
type fetchNotificationsResponseSchemeType = z.infer<typeof fetchNotificationsResponseScheme>;

export type { addNotificationTokenRequestSchemeType, notificationSchemeType, fetchNotificationsResponseSchemeType };
