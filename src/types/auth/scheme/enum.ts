import { z } from 'zod';

import { ProviderEnum } from 'schemes/auth/enum';

type ProviderEnumType = z.infer<typeof ProviderEnum>;

export type { ProviderEnumType };
