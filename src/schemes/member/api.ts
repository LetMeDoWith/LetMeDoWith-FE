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

const updateMemberRequestScheme = z.object({
  nickname: z.string().describe('닉네임'),
  selfDescription: z.string().describe('자기소개'),
  profileImageUrl: z.string().describe('프로필 이미지 URL'),
});

const notificationSettingsRequestScheme = z.object({
  baseAlarmYn: z.boolean().describe('기본 알람 수신 여부'),
  todoBotYn: z.boolean().describe('투두 알림봇 알람 수신 여부'),
  feedbackYn: z.boolean().describe('잔소리 (피드백) 알람 수신 여부'),
  marketingYn: z.boolean().describe('마케팅, 광고성 알람 수신 여부'),
});

export {
  validNicknameRequestScheme,
  validNicknameResponseScheme,
  signUpRequestScheme,
  signUpResponseScheme,
  updateMemberRequestScheme,
  notificationSettingsRequestScheme,
};
