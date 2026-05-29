import { z } from 'zod';

import { BasePageResponseScheme } from 'schemes/shared/api';

const addNotificationTokenRequestScheme = z.object({
  notificationToken: z.string().describe('앱에서 수신한 FCM 토큰'),
});

const notificationScheme = z.object({
  notificationId: z.number().describe('알림 ID'),
  title: z.string().describe('알림 제목'),
  body: z.string().describe('알림 내용'),
  image: z.string().nullable().describe('알림 이미지 URL'),
  deepLink: z.string().nullable().describe('딥링크'),
  isConfirmed: z.boolean().describe('확인 여부'),
  createdAt: z.string().describe('생성 일시'),
});

const fetchNotificationsResponseScheme = BasePageResponseScheme.extend({
  data: z.object({
    notifications: z.array(notificationScheme),
  }),
});

export { addNotificationTokenRequestScheme, notificationScheme, fetchNotificationsResponseScheme };
