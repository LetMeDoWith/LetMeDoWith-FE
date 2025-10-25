import { z } from 'zod';

import { addNotificationTokenRequestScheme } from 'schemes/notification/api';

type addNotificationTokenRequestSchemeType = z.infer<typeof addNotificationTokenRequestScheme>;

export type { addNotificationTokenRequestSchemeType };
