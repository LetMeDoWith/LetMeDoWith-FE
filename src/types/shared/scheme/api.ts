import { z } from 'zod';

import { BaseResponseScheme, EmptyDataResponseScheme } from 'schemes/shared/api';

type BaseResponseSchemeType = z.infer<typeof BaseResponseScheme>;
type EmptyDataResponseSchemeType = z.infer<typeof EmptyDataResponseScheme>;

export type { BaseResponseSchemeType, EmptyDataResponseSchemeType };
