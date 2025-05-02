import { z } from 'zod';

import { BaseResponseScheme } from 'schemes/shared/api';
import { fetchTokenResponseScheme } from 'schemes/auth/api';

const validNicknameRequestScheme = z.object({
  nickname: z.string(),
});

const validNicknameResponseScheme = BaseResponseScheme.extend({
  data: z.string(),
});

const signUpRequestScheme = z.object({
  nickname: z.string(),
  dateOfBirth: z.string(),
  gender: z.string(),
  agreements: z.object({
    termsOfAgree: z.boolean(),
    privacy: z.boolean(),
    advertisement: z.boolean(),
  }),
});

const signUpResponseScheme = fetchTokenResponseScheme;

export { validNicknameRequestScheme, validNicknameResponseScheme, signUpRequestScheme, signUpResponseScheme };
