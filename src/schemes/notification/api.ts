import { z } from 'zod';

const addNotificationTokenRequestScheme = z.object({
  notificationToken: z.string().describe('앱에서 수신한 FCM 토큰'),
});

export { addNotificationTokenRequestScheme };
