import { z } from 'zod';

import { BasePageResponseScheme } from 'schemes/shared/api';

const taskFeedbackTemplateScheme = z.object({
  id: z.number().describe('템플릿 ID'),
  language: z.enum(['KR', 'US', 'JP', 'CN', 'UK']).describe('템플릿 언어'),
  message: z.string().describe('템플릿 메시지'),
  emojiUrl: z.string().describe('템플릿 이모지 URL'),
});

const sendFeedbackScheme = z.object({
  id: z.number().describe('피드백 ID'),
  dowithTaskId: z.number().describe('두윗 Task ID'),
  senderId: z.string().describe('보낸 사람 member ID'),
  senderNickname: z.string().describe('보낸 사람 닉네임'),
  senderProfileImageUrl: z.string().describe('보낸 사람 프로필 이미지 URL'),
  isChecked: z.boolean().describe('피드백 확인 여부'),
  taskFeedbackTemplate: taskFeedbackTemplateScheme,
});

const fetchSendFeedbacksResponseScheme = BasePageResponseScheme.extend({
  data: z.object({
    feedbacks: z.array(sendFeedbackScheme),
  }),
});

export { taskFeedbackTemplateScheme, sendFeedbackScheme, fetchSendFeedbacksResponseScheme };
