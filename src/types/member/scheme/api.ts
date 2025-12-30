import { z } from 'zod';

import {
  notificationSettingsRequestScheme,
  signUpRequestScheme,
  signUpResponseScheme,
  validNicknameRequestScheme,
  validNicknameResponseScheme,
} from 'schemes/member/api';

type validNicknameRequestSchemeType = z.infer<typeof validNicknameRequestScheme>;
type validNicknameResponseSchemeType = z.infer<typeof validNicknameResponseScheme>;
type signUpRequestSchemeType = z.infer<typeof signUpRequestScheme>;
type signUpResponseSchemeType = z.infer<typeof signUpResponseScheme>;
type notificationSettingsRequestSchemeType = z.infer<typeof notificationSettingsRequestScheme>;

export type {
  validNicknameRequestSchemeType,
  validNicknameResponseSchemeType,
  signUpRequestSchemeType,
  signUpResponseSchemeType,
  notificationSettingsRequestSchemeType,
};
