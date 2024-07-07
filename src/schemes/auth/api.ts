import { z } from 'zod';

import { ProviderEnum } from 'schemes/auth/enum';
import { BaseResponseScheme } from 'schemes/shared/api';

const getTokenRequestScheme = z.object({
  provider: ProviderEnum,
  idToken: z.string(),
});

const getTokenResponseScheme = BaseResponseScheme.extend({
  data: z.object({
    atk: z
      .object({
        token: z.string(),
        expireAt: z.string(),
      })
      .nullable(),
    rtk: z
      .object({
        token: z.string(),
        accessToken: z.string(),
        memberId: z.number(),
        expireAt: z.string(),
      })
      .nullable(),
    signupToken: z
      .object({
        token: z.string(),
        expireAt: z.string(),
      })
      .nullable(),
  }),
});

export { getTokenRequestScheme, getTokenResponseScheme };
