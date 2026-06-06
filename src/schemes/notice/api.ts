import { z } from 'zod';

import { BasePageResponseScheme, BaseResponseScheme } from 'schemes/shared/api';

const noticeScheme = z.object({
  id: z.number(),
  title: z.string(),
  type: z.enum(['NOTICE', 'EVENT']),
  createdAt: z.string(),
  thumbnailImageUrl: z.string(),
});

const noticeDetailScheme = noticeScheme.extend({
  content: z.string(),
});

const fetchNoticesResponseScheme = BasePageResponseScheme.extend({
  data: z.object({
    notices: z.array(noticeScheme),
  }),
});

const fetchNoticeDetailResponseScheme = BaseResponseScheme.extend({
  data: noticeDetailScheme,
});

export { noticeScheme, noticeDetailScheme, fetchNoticesResponseScheme, fetchNoticeDetailResponseScheme };
