import { z } from 'zod';

import { BasePageResponseScheme, BaseResponseScheme } from 'schemes/shared/api';
import { LANGUAGE_CODE_VALUES } from 'constants/shared';

const taskFeedbackTemplateScheme = z.object({
  id: z.number().describe('템플릿 ID'),
  language: z.enum(LANGUAGE_CODE_VALUES).describe('템플릿 언어'),
  name: z.string().describe('템플릿 이름'),
  message: z.string().describe('템플릿 메시지(푸시 알림용 - 서버에서 사용)'),
  emojiUrl: z.string().describe('템플릿 이모지 URL'),
});

const sentFeedbackScheme = z.object({
  id: z.number().describe('피드백 ID'),
  dowithTaskId: z.number().describe('두윗 Task ID'),
  dowithTaskTitle: z.string().describe('두윗 Task 제목'),
  receiverId: z.string().describe('받는 사람 member ID'),
  receiverNickname: z.string().describe('받는 사람 닉네임'),
  receiverProfileImageUrl: z.string().describe('받는 사람 프로필 이미지 URL'),
  isChecked: z.boolean().describe('피드백 확인 여부'),
  dowithTaskStatus: z.enum(['WAIT', 'SUCCESS', 'FAIL']).describe('두윗 Task 달성 상태'),
  parsedMessage: z.string().describe('닉네임 치환된 잔소리 메시지'),
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
  parsedMessage: z.string().describe('닉네임 치환된 잔소리 메시지'),
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

const fetchFeedbackTemplatesResponseScheme = BaseResponseScheme.extend({
  data: z.object({
    templates: z.array(taskFeedbackTemplateScheme),
  }),
});

const feedbackAggregateItemScheme = z.object({
  feedbackTemplateId: z.number().describe('피드백 템플릿 ID'),
  count: z.number().describe('해당 템플릿 잔소리 수'),
});

const fetchFeedbackAggregatesResponseScheme = BaseResponseScheme.extend({
  data: z.object({
    aggregates: z.array(feedbackAggregateItemScheme),
  }),
});

const dowithTaskFeedbackTemplateScheme = z.object({
  id: z.number().describe('템플릿 ID'),
  language: z.enum(LANGUAGE_CODE_VALUES).describe('템플릿 언어'),
  name: z.string().describe('템플릿 이름'),
  emojiUrl: z.string().describe('템플릿 이모지 URL'),
});

const dowithTaskFeedbackScheme = z.object({
  id: z.number().describe('피드백 ID'),
  dowithTaskId: z.number().describe('두윗 Task ID'),
  dowithTaskTitle: z.string().describe('두윗 Task 제목'),
  senderId: z.string().describe('보낸 사람 member ID'),
  senderNickname: z.string().describe('보낸 사람 닉네임'),
  senderProfileImageUrl: z.string().describe('보낸 사람 프로필 이미지 URL'),
  isChecked: z.boolean().describe('피드백 확인 여부'),
  taskFeedbackTemplate: dowithTaskFeedbackTemplateScheme,
});

const fetchDowithTaskFeedbacksResponseScheme = BasePageResponseScheme.extend({
  data: z.object({
    feedbacks: z.array(dowithTaskFeedbackScheme),
  }),
});

export {
  taskFeedbackTemplateScheme,
  sentFeedbackScheme,
  receivedFeedbackScheme,
  fetchSentFeedbacksResponseScheme,
  fetchReceivedFeedbacksResponseScheme,
  fetchFeedbackTemplatesResponseScheme,
  feedbackAggregateItemScheme,
  fetchFeedbackAggregatesResponseScheme,
  dowithTaskFeedbackScheme,
  fetchDowithTaskFeedbacksResponseScheme,
};
