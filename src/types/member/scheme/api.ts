import { z } from 'zod';

import {
  deleteAccountResponseScheme,
  signUpRequestScheme,
  signUpResponseScheme,
  validNicknameRequestScheme,
  validNicknameResponseScheme,
} from 'schemes/member/api';

type validNicknameRequestSchemeType = z.infer<typeof validNicknameRequestScheme>;
type validNicknameResponseSchemeType = z.infer<typeof validNicknameResponseScheme>;
type signUpRequestSchemeType = z.infer<typeof signUpRequestScheme>;
type signUpResponseSchemeType = z.infer<typeof signUpResponseScheme>;
type deleteAccountResponseSchemeType = z.infer<typeof deleteAccountResponseScheme>;

export type {
  validNicknameRequestSchemeType,
  validNicknameResponseSchemeType,
  signUpRequestSchemeType,
  signUpResponseSchemeType,
  deleteAccountResponseSchemeType,
};
