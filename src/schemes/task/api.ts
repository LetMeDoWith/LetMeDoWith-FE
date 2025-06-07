import { z } from 'zod';

import { BaseResponseScheme } from 'schemes/shared/api';
import { CREATION_TYPE_ENUM } from 'schemes/task/enum';

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

export { taskCategoryScheme, fetchTaskCategoryListResponseScheme };
