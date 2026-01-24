import { z } from 'zod';

import { BaseResponseScheme } from 'schemes/shared/api';
import { CREATION_TYPE_ENUM, TASK_ROUTINE_CYCLE_ENUM, TASK_STATUS_ENUM } from 'schemes/task/enum';

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

const taskRoutineConditionScheme = z.object({
  startDate: z.string().describe('루틴 시작일자'),
  endDate: z.string().describe('루틴 종료일자'),
  cycle: TASK_ROUTINE_CYCLE_ENUM.describe('루틴 주기'),
  pattern: z.array(z.number()).describe('루틴 패턴 (요일 등)'),
  isExcludeHolidays: z.boolean().describe('휴일 제외 여부'),
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
  successImageUrls: z.array(z.string()).nullable().describe('인증 이미지 URL 리스트'),
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

const addTaskRequestScheme = todoTaskScheme.omit({ id: true, status: true, taskCategoryName: true }).extend({
  routineCondition: taskRoutineConditionScheme.nullable(),
});

const taskFormScheme = addTaskRequestScheme.omit({ routineCondition: true }).extend({
  routineCondition: taskRoutineConditionScheme.omit({ startDate: true, endDate: true, cycle: true }).extend({
    startDate: z.string().nullable().describe('루틴 시작일자'),
    endDate: z.string().nullable().describe('루틴 종료일자'),
    cycle: TASK_ROUTINE_CYCLE_ENUM.nullable().describe('루틴 주기'),
  }),
});

const updateTodoTaskStatusResponseScheme = BaseResponseScheme.extend({
  data: z.number().describe('완료된 task id'),
});

const fetchTodoTaskRequestScheme = z.object({
  todoTaskId: z.number().describe('투두 task id'),
});

const fetchTodoTaskResponseDataScheme = todoTaskScheme.extend({
  routineCondition: taskRoutineConditionScheme.nullable(),
});

const fetchTodoTaskResponseScheme = BaseResponseScheme.extend({ data: fetchTodoTaskResponseDataScheme });

const fetchDowithTaskRequestScheme = z.object({
  dowithTaskId: z.number().describe('두윗 task id'),
});

const fetchDowithTaskResponseScheme = BaseResponseScheme.extend({ data: addTaskRequestScheme });

const updateTaskRequestScheme = todoTaskScheme
  .pick({ title: true, startTime: true, taskCategoryId: true })
  .extend({ routineCondition: taskRoutineConditionScheme.nullable().optional() });

const updateTaskRoutineRequestScheme = taskRoutineConditionScheme.optional();

const uploadTaskSuccessImageUrlListRequestScheme = z.object({
  imageFileNames: z.array(z.string()).describe('이미지 파일 이름 리스트'),
});

const uploadTaskSuccessImageUrlListResponseScheme = BaseResponseScheme.extend({
  data: z.object({
    presignedUrls: z.array(z.string()).describe('이미지 업로드 할 url 리스트'),
    method: z.string(),
  }),
});

const updateDowithTaskStatusSuccessRequestScheme = z.object({
  publicImageUrls: z.array(z.string()).describe('이미지 파일 url 리스트'),
});

export {
  taskCategoryScheme,
  fetchTaskCategoryListResponseScheme,
  fetchTaskListRequestScheme,
  todoTaskScheme,
  fetchTodoTaskRequestScheme,
  fetchTodoTaskResponseDataScheme,
  fetchTodoTaskResponseScheme,
  dowithTaskScheme,
  fetchTaskListResponseDataScheme,
  fetchTaskListResponseScheme,
  addTaskRequestScheme,
  taskFormScheme,
  updateTodoTaskStatusResponseScheme,
  fetchDowithTaskRequestScheme,
  fetchDowithTaskResponseScheme,
  updateTaskRequestScheme,
  updateTaskRoutineRequestScheme,
  uploadTaskSuccessImageUrlListRequestScheme,
  uploadTaskSuccessImageUrlListResponseScheme,
  updateDowithTaskStatusSuccessRequestScheme,
};
