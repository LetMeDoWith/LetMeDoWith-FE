import { z } from 'zod';

import {
  fetchTokenRequestScheme,
  fetchTokenResponseScheme,
  refreshTokenRequestScheme,
  refreshTokenResponseScheme,
} from 'schemes/auth/api';

type fetchTokenRequestSchemeType = z.infer<typeof fetchTokenRequestScheme>;
type fetchTokenResponseSchemeType = z.infer<typeof fetchTokenResponseScheme>;
type refreshTokenRequestSchemeType = z.infer<typeof refreshTokenRequestScheme>;
type refreshTokenResponseSchemeType = z.infer<typeof refreshTokenResponseScheme>;

export type {
  fetchTokenRequestSchemeType,
  fetchTokenResponseSchemeType,
  refreshTokenRequestSchemeType,
  refreshTokenResponseSchemeType,
};
