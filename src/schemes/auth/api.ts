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
    accessToken: tokenScheme.nullable(),
    refreshToken: tokenScheme.nullable(),
    signupToken: tokenScheme.nullable(),
    memberId: z.string(),
  }),
});

const refreshTokenRequestScheme = z.object({
  refreshToken: z.string(),
});

const refreshTokenResponseScheme = BaseResponseScheme.extend({
  data: z.object({
    accessToken: tokenScheme,
    refreshToken: tokenScheme,
    memberId: z.string(),
  }),
});

export { fetchTokenRequestScheme, fetchTokenResponseScheme, refreshTokenRequestScheme, refreshTokenResponseScheme };
