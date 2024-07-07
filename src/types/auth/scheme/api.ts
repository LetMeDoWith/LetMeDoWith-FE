import { z } from 'zod';

import { getTokenRequestScheme, getTokenResponseScheme } from 'schemes/auth/api';

type getTokenRequestSchemeType = z.infer<typeof getTokenRequestScheme>;
type getTokenResponseSchemeType = z.infer<typeof getTokenResponseScheme>;

export type { getTokenRequestSchemeType, getTokenResponseSchemeType };
