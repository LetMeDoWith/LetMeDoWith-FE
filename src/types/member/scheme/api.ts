import { z } from 'zod';

import {
  notificationSettingsRequestScheme,
  signUpRequestScheme,
  signUpResponseScheme,
  updateMemberRequestScheme,
  validNicknameRequestScheme,
  validNicknameResponseScheme,
  profileImageUploadPresignedUrlRequestScheme,
  profileImageUploadPresignedUrlResponseScheme,
  myDowithInfoResponseScheme,
} from 'schemes/member/api';

type validNicknameRequestSchemeType = z.infer<typeof validNicknameRequestScheme>;
type validNicknameResponseSchemeType = z.infer<typeof validNicknameResponseScheme>;
type signUpRequestSchemeType = z.infer<typeof signUpRequestScheme>;
type signUpResponseSchemeType = z.infer<typeof signUpResponseScheme>;
type updateMemberRequestSchemeType = z.infer<typeof updateMemberRequestScheme>;
type notificationSettingsRequestSchemeType = z.infer<typeof notificationSettingsRequestScheme>;
type profileImageUploadPresignedUrlRequestSchemeType = z.infer<typeof profileImageUploadPresignedUrlRequestScheme>;
type profileImageUploadPresignedUrlResponseSchemeType = z.infer<typeof profileImageUploadPresignedUrlResponseScheme>;
type myDowithInfoResponseSchemeType = z.infer<typeof myDowithInfoResponseScheme>;

export type {
  validNicknameRequestSchemeType,
  validNicknameResponseSchemeType,
  signUpRequestSchemeType,
  signUpResponseSchemeType,
  updateMemberRequestSchemeType,
  notificationSettingsRequestSchemeType,
  profileImageUploadPresignedUrlRequestSchemeType,
  profileImageUploadPresignedUrlResponseSchemeType,
  myDowithInfoResponseSchemeType,
};
