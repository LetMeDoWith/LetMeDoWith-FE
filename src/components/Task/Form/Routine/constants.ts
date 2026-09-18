import dayjs from 'dayjs';

import { theme } from 'styles/theme';

/*
 * 보이는 달의 주 수만큼만 노출하고 나머지는 overflow로 자르므로, 두 값이 실제 렌더 높이와 어긋나면 여백이 남는다.
 * 행 = 셀 36 + week 상하 마진(7×2). 헤더 = 헤더 컨테이너 marginTop 6 + SUB_TITLE lineHeight 20.
 */
const CALENDAR_ROW_HEIGHT = 50;
const CALENDAR_HEADER_HEIGHT = 26;
/* CalendarList 자체 높이는 최대(6주)로 고정해 달 전환 시 재렌더를 줄이고, 실제 노출 높이는 wrapper의 overflow로 제어한다. */
const CALENDAR_LIST_MAX_HEIGHT = CALENDAR_HEADER_HEIGHT + CALENDAR_ROW_HEIGHT * 6;

/* CalendarList 항목 재렌더 최소화용: props를 안정 참조로 유지해 스와이프 중 부모 재렌더가 전파되지 않게 한다. */
const CALENDAR_LIST_STYLE = { paddingLeft: 0, paddingRight: 0 };
const CALENDAR_HEADER_STYLE = { paddingHorizontal: 15 };

/* 달력 첫날의 요일(0=일) 기준으로 해당 월이 몇 주에 걸치는지 계산한다. */
const getWeeksInMonth = (dateString: string) => {
  const startOfMonth = dayjs(dateString).startOf('month');
  return Math.ceil((startOfMonth.day() + startOfMonth.daysInMonth()) / 7);
};

const getDayTextColor = (dateString: string, state?: string) => {
  // 선택할 수 없는 요일은 회색 처리
  if (state === 'disabled') {
    return theme.COLORS.GRAY_SCALE.GRAY_80;
  }

  const dayOfWeek = new Date(dateString).getDay();

  // 일요일
  if (dayOfWeek === 0) {
    return theme.COLORS.PRIMARY.RED_60;
  }

  // 토요일
  if (dayOfWeek === 6) {
    return theme.COLORS.SECONDARY.BLUE_60;
  }

  // 평일
  return theme.COLORS.DEFAULT.BLACK;
};

const WEEKLY_DAY_INFO = [
  { code: 'MONDAY', value: 1, name: '월' },
  { code: 'TUESDAY', value: 2, name: '화' },
  { code: 'WEDNESDAY', value: 3, name: '수' },
  { code: 'THURSDAY', value: 4, name: '목' },
  { code: 'FRIDAY', value: 5, name: '금' },
  { code: 'SATURDAY', value: 6, name: '토' },
  { code: 'SUNDAY', value: 7, name: '일' },
] as const;

export {
  CALENDAR_ROW_HEIGHT,
  CALENDAR_HEADER_HEIGHT,
  CALENDAR_LIST_MAX_HEIGHT,
  CALENDAR_LIST_STYLE,
  CALENDAR_HEADER_STYLE,
  getWeeksInMonth,
  getDayTextColor,
  WEEKLY_DAY_INFO,
};
