import dayjs from 'dayjs';

import type { fetchTaskListRequestSchemeType, fetchTaskListResponseSchemeDataType } from 'types/task/scheme/api';

/*
 * 달력은 보이는 달의 앞뒤 달 날짜까지 함께 그린다(8월 그리드의 7월 말·9월 초).
 * 목록 API가 year·month 단위라 기간 조회가 없어, 보이는 달 기준 3개월을 받아 합친다.
 */
const getSurroundingMonths = (dateString: string): fetchTaskListRequestSchemeType[] => {
  const base = dayjs(dateString);

  return [-1, 0, 1].map(offset => {
    const target = base.add(offset, 'month');
    return { year: target.year(), month: target.month() + 1 };
  });
};

/*
 * 여러 달의 응답을 날짜(YYYY-MM-DD)별로 합친다.
 * 달력 셀·선택 날짜·아이콘 판정에서 O(1)로 조회하기 위한 인덱스다.
 */
const mergeTasksByDate = (taskLists: (fetchTaskListResponseSchemeDataType | undefined)[]) => {
  const map = new Map<string, fetchTaskListResponseSchemeDataType>();

  const getOrCreate = (date: string) => {
    const existing = map.get(date);
    if (existing) {
      return existing;
    }

    const created: fetchTaskListResponseSchemeDataType = { dowithTasks: [], todoTasks: [] };
    map.set(date, created);
    return created;
  };

  taskLists.forEach(taskList => {
    if (!taskList) {
      return;
    }

    taskList.dowithTasks.forEach(task => getOrCreate(task.date).dowithTasks.push(task));
    taskList.todoTasks.forEach(task => getOrCreate(task.date).todoTasks.push(task));
  });

  return map;
};

type CalendarMarking = { selected?: boolean };

/*
 * 달력에 넘길 markedDates를 만든다.
 *
 * CalendarList는 그 달에 마킹 키가 하나도 없으면 해당 월 페이지에 markedDates를 아예 넘기지 않는다
 * (calendar-list의 getMarkedDatesForItem). 그래서 선택 날짜 하나만 넣으면 다른 달 페이지에 얹힌
 * 그 날짜가 선택 표시를 받지 못한다. 보이는 달과 앞뒤 달의 1일에 빈 키를 넣어 필터를 통과시킨다.
 * 빈 마킹은 selected가 없어 화면에는 아무 영향이 없다.
 *
 * 이 객체는 주 뷰의 갱신 신호이기도 하다 — WeekCalendar의 renderItem은 의존성에 dayComponent가
 * 없고 markedDates만 있어서, 이 값이 바뀌지 않으면 날짜를 눌러도 셀이 다시 그려지지 않는다.
 */
const buildCalendarMarkedDates = ({ selectedDate, visibleDate }: { selectedDate: string; visibleDate: string }) => {
  const marks: Record<string, CalendarMarking> = {};

  getSurroundingMonths(visibleDate).forEach(({ year, month }) => {
    marks[`${year}-${String(month).padStart(2, '0')}-01`] = {};
  });

  marks[selectedDate] = { selected: true };

  return marks;
};

export { getSurroundingMonths, mergeTasksByDate, buildCalendarMarkedDates };
