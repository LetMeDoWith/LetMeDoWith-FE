import { z } from 'zod';

import { BasePageResponseScheme } from 'schemes/shared/api';

const taskFeedbackTemplateScheme = z.object({
  id: z.number().describe('템플릿 ID'),
  language: z.enum(['KR', 'US', 'JP', 'CN', 'UK']).describe('템플릿 언어'),
  message: z.string().describe('템플릿 메시지'),
  emojiUrl: z.string().describe('템플릿 이모지 URL'),
});

const sentFeedbackScheme = z.object({
  id: z.number().describe('피드백 ID'),
  dowithTaskId: z.number().describe('두윗 Task ID'),
  senderId: z.string().describe('보낸 사람 member ID'),
  senderNickname: z.string().describe('보낸 사람 닉네임'),
  senderProfileImageUrl: z.string().describe('보낸 사람 프로필 이미지 URL'),
  isChecked: z.boolean().describe('피드백 확인 여부'),
  dowithTaskStatus: z.enum(['WAIT', 'SUCCESS', 'FAIL']).describe('두윗 Task 달성 상태'),
  dowithTaskTitle: z.string().describe('두윗 Task 제목'),
  taskFeedbackTemplate: taskFeedbackTemplateScheme,
});

const receivedFeedbackScheme = z.object({
  id: z.number().describe('피드백 ID'),
  dowithTaskId: z.number().describe('두윗 Task ID'),
  senderId: z.string().describe('보낸 사람 member ID'),
  senderNickname: z.string().describe('보낸 사람 닉네임'),
  senderProfileImageUrl: z.string().describe('보낸 사람 프로필 이미지 URL'),
  isChecked: z.boolean().describe('피드백 확인 여부'),
  receivedAt: z.string().describe('피드백 수신 일시'),
  dowithTaskTitle: z.string().describe('두윗 Task 제목'),
  taskFeedbackTemplate: taskFeedbackTemplateScheme,
});

const fetchSentFeedbacksResponseScheme = BasePageResponseScheme.extend({
  data: z.object({
    feedbacks: z.array(sentFeedbackScheme),
  }),
});

const fetchReceivedFeedbacksResponseScheme = BasePageResponseScheme.extend({
  data: z.object({
    feedbacks: z.array(receivedFeedbackScheme),
  }),
});

export {
  taskFeedbackTemplateScheme,
  sentFeedbackScheme,
  receivedFeedbackScheme,
  fetchSentFeedbacksResponseScheme,
  fetchReceivedFeedbacksResponseScheme,
};
