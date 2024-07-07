import { z } from 'zod';

import { BaseResponseScheme } from 'schemes/shared/api';

type BaseResponseSchemeType = z.infer<typeof BaseResponseScheme>;

export type { BaseResponseSchemeType };
