import { z } from 'zod';

import {
  BasePageResponseScheme,
  BaseResponseScheme,
  EmptyDataResponseScheme,
  PageRequestScheme,
} from 'schemes/shared/api';

type BaseResponseSchemeType = z.infer<typeof BaseResponseScheme>;
type EmptyDataResponseSchemeType = z.infer<typeof EmptyDataResponseScheme>;
type PageRequestSchemeType = z.infer<typeof PageRequestScheme>;
type BasePageResponseSchemeType = z.infer<typeof BasePageResponseScheme>;

export type { BaseResponseSchemeType, EmptyDataResponseSchemeType, PageRequestSchemeType, BasePageResponseSchemeType };
