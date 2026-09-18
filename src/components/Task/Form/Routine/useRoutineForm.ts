import { useCallback, useMemo, useRef, useState } from 'react';
import type { DateData, MarkedDates } from 'react-native-calendars/src/types';
import type { CalendarListImperativeMethods } from 'react-native-calendars/src/calendar-list';
import type { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import dayjs from 'dayjs';

import { CALENDAR_HEADER_HEIGHT, CALENDAR_ROW_HEIGHT, getWeeksInMonth } from 'components/Task/Form/Routine/constants';
import { TASK_ROUTINE_CYCLE_ENUM } from 'schemes/task/enum';
import { theme } from 'styles/theme';
import type {
  addTaskRequestSchemeType,
  fetchTodoTaskResponseDataSchemeType,
  taskFormSchemeType,
} from 'types/task/scheme/api';
import type { TaskRoutineCycleEnumType } from 'types/task/scheme/enum';

type RoutineSource = fetchTodoTaskResponseDataSchemeType | addTaskRequestSchemeType | null | undefined;

interface Params {
  /*
   * 고른 값을 폼에 곧바로 반영할지.
   * 편집 화면은 저장 버튼이 폼을 그대로 제출하므로 매번 반영해야 하고,
   * 바텀시트는 확인을 눌러야 반영되므로 그전까지는 로컬 상태로만 들고 있는다.
   */
  mirrorToForm: boolean;
  setValue: UseFormSetValue<taskFormSchemeType>;
  watch: UseFormWatch<taskFormSchemeType>;
}

/*
 * 루틴 설정 화면과 바텀시트가 공유하는 상태·핸들러.
 * 두 곳의 차이는 "고른 값을 폼에 언제 반영하는가"와 종료일 선택 규칙뿐이라,
 * 그 둘만 mirrorToForm으로 가르고 나머지는 똑같이 쓴다.
 */
const useRoutineForm = ({ mirrorToForm, setValue, watch }: Params) => {
  const targetDateString = watch('date');
  const routineCondition = watch('routineCondition');

  /*
   * current(초기 표시 월)는 마운트 후 바꾸지 않는다. 스와이프에 맞춰 바꾸면 라이브러리가
   * scrollToMonth를 되걸어(에코) 관성과 충돌 → 월이 자동으로 왕복한다.
   */
  const [currentDate] = useState(targetDateString);
  // 가로 페이징 CalendarList는 컨테이너 폭을 알아야 월 단위로 정확히 스냅된다. 화면·시트 폭이 달라 onLayout으로 잰다.
  const [calendarWidth, setCalendarWidth] = useState(0);
  // 보이는 달(스와이프 즉시 반영). wrapper 높이를 이 값으로 구동해 달 전환 시 높이가 곧바로 조정되게 한다.
  const [visibleMonth, setVisibleMonth] = useState(targetDateString);
  const calendarRef = useRef<CalendarListImperativeMethods>(null);

  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);
  const [selectedPrimaryCategory, setSelectedPrimaryCategory] = useState<TaskRoutineCycleEnumType | null>(null);
  const [selectedWeeklyDaySet, setSelectedWeeklyDaySet] = useState<Set<number>>(new Set());
  const [selectedMonthlyDaySet, setSelectedMonthlyDaySet] = useState<Set<number>>(new Set());
  /* 날짜와 반복 패턴은 각각 독립적으로 열고 닫는다 */
  const [expanded, setExpanded] = useState(true);
  const [isPatternExpanded, setIsPatternExpanded] = useState(false);
  const [isExcludeHolidays, setIsExcludeHolidays] = useState(false);

  // wrapper는 보이는 달의 주 수만큼만 노출(overflow로 클립)해 여백을 없앤다.
  const calendarWrapperHeight = useMemo(
    () => CALENDAR_HEADER_HEIGHT + getWeeksInMonth(visibleMonth) * CALENDAR_ROW_HEIGHT,
    [visibleMonth],
  );

  const handleVisibleMonthChange = useCallback((month: DateData) => {
    setVisibleMonth(month.dateString);
  }, []);

  // 화살표는 current를 바꾸지 않고 명령형 스크롤로 이동한다(에코 루프 회피).
  const handleMoveMonth = useCallback((amount: number, baseDate: Date) => {
    calendarRef.current?.scrollToMonth(dayjs(baseDate).add(amount, 'month').format('YYYY-MM-DD'));
  }, []);

  const isValidDatePeriod = selectedEndDate !== null;

  /*
   * 루틴 항목을 하나라도 건드렸는지. 루틴은 선택 사항이라 아무것도 안 고른 상태는 "미설정"으로 그냥 넘어갈 수 있고,
   * 하나라도 골랐으면 제대로 채웠는지 검사한다. 공휴일 제외는 부가 옵션이라 여기 넣지 않는다.
   */
  const hasAnySelection =
    selectedEndDate !== null ||
    selectedPrimaryCategory !== null ||
    selectedWeeklyDaySet.size > 0 ||
    selectedMonthlyDaySet.size > 0;

  const getIsValidRoutineCondition = () => {
    if (!isValidDatePeriod) {
      return false;
    }

    if (selectedPrimaryCategory === TASK_ROUTINE_CYCLE_ENUM.enum.DAILY) {
      return true;
    }

    if (selectedPrimaryCategory === TASK_ROUTINE_CYCLE_ENUM.enum.WEEKLY) {
      return selectedWeeklyDaySet.size > 0;
    }

    return selectedMonthlyDaySet.size > 0;
  };

  const getMarkedPeriodDates = (end: string | null): MarkedDates => {
    const startDate = dayjs(routineCondition?.startDate || targetDateString).startOf('day');

    // 종료일 없으면 단일 선택 마킹
    if (!end) {
      const single = routineCondition?.startDate || targetDateString;
      return {
        [single]: {
          startingDay: true,
          endingDay: true, // 단일 날짜일 경우 시작/끝이 같아야 마커가 반쪽만 보이지 않음
          selected: true,
          color: theme.COLORS.GRAY_SCALE.GRAY_92,
          textColor: theme.COLORS.DEFAULT.BLACK,
        },
      };
    }

    const endDate = dayjs(end);
    const marked: MarkedDates = {};

    let current = startDate;
    let index = 0;
    const totalDays = endDate.diff(startDate, 'day') + 1;

    while (current.isSameOrBefore(endDate, 'day')) {
      const dateStr = current.format('YYYY-MM-DD');

      if (index === 0) {
        marked[dateStr] = {
          startingDay: true,
          color: theme.COLORS.GRAY_SCALE.GRAY_92,
          textColor: theme.COLORS.DEFAULT.BLACK,
        };
      } else if (index === totalDays - 1) {
        marked[dateStr] = {
          endingDay: true,
          color: theme.COLORS.GRAY_SCALE.GRAY_92,
          textColor: theme.COLORS.DEFAULT.BLACK,
        };
      } else {
        marked[dateStr] = {
          color: theme.COLORS.GRAY_SCALE.GRAY_96,
          textColor: theme.COLORS.DEFAULT.BLACK,
        };
      }

      current = current.add(1, 'day');
      index++;
    }

    return marked;
  };

  // 스와이프 중 부모 재렌더로 매번 새 객체가 생기지 않도록 메모이즈(선택 기간이 바뀔 때만 갱신).
  const markedDates = useMemo(
    () => getMarkedPeriodDates(selectedEndDate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedEndDate, routineCondition?.startDate, targetDateString],
  );

  const handleExcludeHolidays = (value: boolean) => {
    if (mirrorToForm) {
      setValue('routineCondition.isExcludeHolidays', value, { shouldDirty: true, shouldTouch: true });
    }
    setIsExcludeHolidays(value);
  };

  /* 서버 데이터(수정) 또는 현재 폼 값(등록)으로 선택 상태를 되돌린다 */
  const initRoutineCondition = (data?: RoutineSource) => {
    const getSelectedDaySet = (type: Exclude<TaskRoutineCycleEnumType, 'DAILY'>) => {
      const cycle = data?.routineCondition?.cycle ?? routineCondition?.cycle;
      if (!cycle || cycle === TASK_ROUTINE_CYCLE_ENUM.enum.DAILY) {
        return new Set<number>();
      }

      if (type === cycle) {
        return new Set<number>(routineCondition.pattern);
      }

      return new Set<number>();
    };

    setSelectedEndDate(data?.routineCondition?.endDate ?? routineCondition?.endDate ?? null);
    setIsExcludeHolidays(data?.routineCondition?.isExcludeHolidays ?? routineCondition?.isExcludeHolidays ?? false);
    setSelectedPrimaryCategory(data?.routineCondition?.cycle ?? routineCondition?.cycle ?? null);
    setSelectedWeeklyDaySet(getSelectedDaySet(TASK_ROUTINE_CYCLE_ENUM.enum.WEEKLY));
    setSelectedMonthlyDaySet(getSelectedDaySet(TASK_ROUTINE_CYCLE_ENUM.enum.MONTHLY));
    setExpanded(true);

    setValue('routineCondition', {
      startDate: data?.routineCondition?.startDate ?? routineCondition?.startDate ?? targetDateString,
      endDate: data?.routineCondition?.endDate ?? routineCondition?.endDate ?? null,
      cycle: data?.routineCondition?.cycle ?? routineCondition?.cycle ?? null,
      pattern: data?.routineCondition?.pattern ?? routineCondition?.pattern ?? [],
      isExcludeHolidays: data?.routineCondition?.isExcludeHolidays ?? routineCondition?.isExcludeHolidays ?? false,
    });
  };

  /* 고른 루틴을 전부 비운다(초기화). 시작 날짜는 태스크 날짜라 그대로 둔다. */
  const resetSelection = () => {
    setSelectedEndDate(null);
    setSelectedPrimaryCategory(null);
    setSelectedWeeklyDaySet(new Set());
    setSelectedMonthlyDaySet(new Set());
    setIsExcludeHolidays(false);

    if (mirrorToForm) {
      setValue(
        'routineCondition',
        {
          startDate: targetDateString,
          endDate: null,
          cycle: null,
          pattern: [],
          isExcludeHolidays: false,
        },
        { shouldDirty: true, shouldTouch: true },
      );
    }
  };

  const getPattern = () => {
    if (selectedPrimaryCategory === TASK_ROUTINE_CYCLE_ENUM.enum.WEEKLY) {
      return Array.from(selectedWeeklyDaySet);
    }
    if (selectedPrimaryCategory === TASK_ROUTINE_CYCLE_ENUM.enum.MONTHLY) {
      return Array.from(selectedMonthlyDaySet);
    }
    return [];
  };

  const buildRoutineCondition = () => ({
    startDate: targetDateString,
    endDate: selectedEndDate,
    cycle: selectedPrimaryCategory,
    pattern: getPattern(),
    isExcludeHolidays,
  });

  /*
   * 종료일 선택. 고를 수 없는 경우가 화면마다 다르다.
   * 수정 화면 — 이미 종료일로 설정된 날짜
   * 등록(시트) — 시작일과 같거나 이전 날짜
   */
  const handleDayPress = useCallback(
    (date: DateData) => {
      if (
        (mirrorToForm && date.dateString === routineCondition?.endDate) ||
        (!mirrorToForm && dayjs(date.dateString).isSameOrBefore(targetDateString))
      ) {
        return;
      }

      setSelectedEndDate(prev => {
        // 선택한 종료일을 다시 누르면 미선택으로 되돌린다
        if (prev === date.dateString) {
          if (mirrorToForm) {
            setValue('routineCondition.endDate', null, { shouldDirty: true, shouldTouch: true });
          }
          return null;
        }

        if (mirrorToForm) {
          setValue('routineCondition.endDate', date.dateString, { shouldDirty: true, shouldTouch: true });
        }
        return date.dateString;
      });
    },
    [mirrorToForm, routineCondition?.endDate, targetDateString, setValue],
  );

  const handlePrimaryCategory = (value: TaskRoutineCycleEnumType) => () => {
    // 매 주가 아니면 골라둔 요일을 비운다
    if (value !== TASK_ROUTINE_CYCLE_ENUM.enum.WEEKLY) {
      if (mirrorToForm) {
        setValue('routineCondition.pattern', [], { shouldDirty: true, shouldTouch: true });
      }
      setSelectedWeeklyDaySet(new Set());
    }

    // 매 월이 아니면 골라둔 일자를 비운다
    if (value !== TASK_ROUTINE_CYCLE_ENUM.enum.MONTHLY) {
      if (mirrorToForm) {
        setValue('routineCondition.pattern', [], { shouldDirty: true, shouldTouch: true });
      }
      setSelectedMonthlyDaySet(new Set());
    }

    setSelectedPrimaryCategory(value);
    if (mirrorToForm) {
      setValue('routineCondition.cycle', value, { shouldDirty: true, shouldTouch: true });
    }
  };

  const togglePatternDay = (setter: React.Dispatch<React.SetStateAction<Set<number>>>) => (value: number) => {
    setter(prev => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }

      if (mirrorToForm) {
        setValue('routineCondition.pattern', Array.from(next), { shouldDirty: true, shouldTouch: true });
      }
      return next;
    });
  };

  return {
    targetDateString,
    routineCondition,
    currentDate,
    calendarRef,
    calendarWidth,
    setCalendarWidth,
    calendarWrapperHeight,
    markedDates,
    handleVisibleMonthChange,
    handleMoveMonth,
    handleDayPress,
    selectedEndDate,
    selectedPrimaryCategory,
    handlePrimaryCategory,
    selectedWeeklyDaySet,
    toggleWeeklyDay: togglePatternDay(setSelectedWeeklyDaySet),
    selectedMonthlyDaySet,
    toggleMonthlyDay: togglePatternDay(setSelectedMonthlyDaySet),
    expanded,
    toggleExpanded: () => setExpanded(prev => !prev),
    isPatternExpanded,
    togglePatternExpanded: () => setIsPatternExpanded(prev => !prev),
    isExcludeHolidays,
    handleExcludeHolidays,
    hasAnySelection,
    getIsValidRoutineCondition,
    initRoutineCondition,
    buildRoutineCondition,
    resetSelection,
    /* 닫기 시 롤백 판정에 쓰인다 */
    setSelectedEndDate,
    setSelectedPrimaryCategory,
    setSelectedWeeklyDaySet,
    setSelectedMonthlyDaySet,
    setIsExcludeHolidays,
  };
};

export { useRoutineForm };
export type { RoutineSource };
