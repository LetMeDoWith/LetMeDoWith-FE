import { z } from 'zod';

import { ProviderEnum } from 'schemes/auth/enum';
import { BaseResponseScheme } from 'schemes/shared/api';

const tokenScheme = z.object({
  token: z.string(),
  expireAt: z.string(),
});

const fetchTokenRequestScheme = z.object({
  provider: ProviderEnum,
  idToken: z.string(),
});

const fetchTokenResponseScheme = BaseResponseScheme.extend({
  data: z.object({
    atk: tokenScheme.nullable(),
    rtk: tokenScheme.nullable(),
    signupToken: tokenScheme.nullable(),
  }),
});

const refreshTokenRequestScheme = z.object({
  refreshToken: z.string(),
});

const refreshTokenResponseScheme = BaseResponseScheme.extend({
  data: z.object({
    atk: tokenScheme,
    rtk: tokenScheme,
  }),
});

export { fetchTokenRequestScheme, fetchTokenResponseScheme, refreshTokenRequestScheme, refreshTokenResponseScheme };
