import { z } from 'zod';

import {
  noticeScheme,
  noticeDetailScheme,
  fetchNoticesResponseScheme,
  fetchNoticeDetailResponseScheme,
} from 'schemes/notice/api';

type noticeSchemeType = z.infer<typeof noticeScheme>;
type noticeDetailSchemeType = z.infer<typeof noticeDetailScheme>;
type fetchNoticesResponseSchemeType = z.infer<typeof fetchNoticesResponseScheme>;
type fetchNoticeDetailResponseSchemeType = z.infer<typeof fetchNoticeDetailResponseScheme>;

export type {
  noticeSchemeType,
  noticeDetailSchemeType,
  fetchNoticesResponseSchemeType,
  fetchNoticeDetailResponseSchemeType,
};
