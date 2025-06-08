import { z } from 'zod';

import { BaseResponseScheme } from 'schemes/shared/api';
import { CREATION_TYPE_ENUM, TASK_STATUS_ENUM } from 'schemes/task/enum';

const taskCategoryScheme = z.object({
  id: z.number().describe('조회한 Task Category의 id'),
  title: z.string().describe('Task Category의 이름'),
  creationType: CREATION_TYPE_ENUM.describe('Task Category의 타입 (공통 / 유저 개인)'),
  emoji: z.string().describe('Task Category 표시 이모티콘'),
  categoryHolderId: z.string().describe('유저 생성 Category 인 경우 생성한 member의 id'),
});

const fetchTaskCategoryListResponseScheme = BaseResponseScheme.extend({
  data: z.array(taskCategoryScheme),
});

const todoTaskScheme = z.object({
  id: z.number().describe('테스크 id'),
  taskCategoryId: z.number().nullable().describe('테스크 카테고리 id'),
  taskCategoryName: z.string().nullable().describe('테스크 카테고리 이름'),
  title: z.string().describe('테스크 제목'),
  status: TASK_STATUS_ENUM.describe('테스크 상태'),
  date: z.string().describe('테스크 수행일자'),
  startTime: z.string().nullable().describe('테스크 시작시간'),
});

const dowithTaskScheme = todoTaskScheme.omit({ startTime: true }).extend({
  confirmedImageUrl: z.string().nullable().describe('인증 이미지 URL'),
  feedBackCount: z.number().describe('피드백 개수'),
  startTime: z.string().describe('테스크 시작시간'),
});

const fetchTaskListRequestScheme = z.object({
  year: z.number().describe('선택한 년도'),
  month: z.number().describe('선택한 월'),
});

const fetchTaskListResponseDataScheme = z.object({
  todoTasks: z.array(todoTaskScheme),
  dowithTasks: z.array(dowithTaskScheme),
});

const fetchTaskListResponseScheme = BaseResponseScheme.extend({
  data: z.object({
    todoTasks: z.array(todoTaskScheme),
    dowithTasks: z.array(dowithTaskScheme),
  }),
});

export {
  taskCategoryScheme,
  fetchTaskCategoryListResponseScheme,
  fetchTaskListRequestScheme,
  todoTaskScheme,
  dowithTaskScheme,
  fetchTaskListResponseDataScheme,
  fetchTaskListResponseScheme,
};
