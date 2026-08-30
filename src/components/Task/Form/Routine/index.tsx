import React, { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Divider, Switch } from 'react-native-paper';
import { CalendarList } from 'react-native-calendars';
import type { DateData, MarkedDates } from 'react-native-calendars/src/types';
import type { CalendarListImperativeMethods } from 'react-native-calendars/src/calendar-list';
import dayjs from 'dayjs';
import type { DayProps } from 'react-native-calendars/src/calendar/day';
import { FormState, useFormContext, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { getBottomSpace } from 'react-native-iphone-screen-helper';
import type { StackScreenProps } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

import { theme } from 'styles/theme';
import { DropArrow } from 'components/common/icons/DropArrow';
import type { TaskFormStackParamList, TaskModeType } from 'types/shared';
import { CustomCalendarHeader } from 'components/Task';
import {
  addTaskRequestSchemeType,
  fetchTodoTaskResponseDataSchemeType,
  taskFormSchemeType,
} from 'types/task/scheme/api';
import { isAos } from 'utils/device';
import { useFetchTodoTask } from 'hooks/queries/task/useFetchTodoTask';
import { useFetchDowithTask } from 'hooks/queries/task/useFetchDowithTask';
import { TASK_ROUTINE_CYCLE_ENUM } from 'schemes/task/enum';
import { useUpdateTaskRoutine } from 'hooks/queries/task/useUpdateTaskRoutine';
import type { TaskRoutineCycleEnumType } from 'types/task/scheme/enum';

// 가로 페이징 CalendarList는 고정 높이가 필요하다. 커스텀 셀 높이(36) + 주 상하 마진(7×2)=50,
// 헤더 약 48. 보이는 달의 주 수에 맞춰 높이를 동적으로 잡고 overflow로 잘라 불필요한 여백을 없앤다.
const CALENDAR_ROW_HEIGHT = 50;
const CALENDAR_HEADER_HEIGHT = 48;
// CalendarList 자체 높이는 최대(6주)로 고정해 달 전환 시 재렌더를 줄이고, 실제 노출 높이는 wrapper의 overflow로 제어한다.
const CALENDAR_LIST_MAX_HEIGHT = CALENDAR_HEADER_HEIGHT + CALENDAR_ROW_HEIGHT * 6;
// 달력 첫날의 요일(0=일) 기준으로 해당 월이 몇 주에 걸치는지 계산한다.
const getWeeksInMonth = (dateString: string) => {
  const startOfMonth = dayjs(dateString).startOf('month');
  return Math.ceil((startOfMonth.day() + startOfMonth.daysInMonth()) / 7);
};

// CalendarList 항목 재렌더 최소화용: props를 안정 참조로 유지(모듈 상수/memo)해 스와이프 중 부모 재렌더가 전파되지 않게 한다.
const CALENDAR_LIST_STYLE = { paddingLeft: 0, paddingRight: 0 };
const CALENDAR_HEADER_STYLE = { paddingHorizontal: 15 };
const MemoizedCalendarList = memo(CalendarList);

/*
 * 저장 버튼은 ScrollView 위에 absolute로 떠 있다.
 * 버튼이 콘텐츠를 가리지 않도록 스크롤 하단 패딩을 버튼 높이·위치에서 파생시킨다.
 * 하단 여백은 앱의 다른 하단 버튼들과 같은 관례를 따른다(iOS는 홈 인디케이터 높이 + 24).
 */
const SAVE_BUTTON_HEIGHT = 64;
const SAVE_BUTTON_BOTTOM = isAos ? 24 : getBottomSpace() + 24;
const SAVE_BUTTON_CONTENT_GAP = 16;
const SCROLL_BOTTOM_PADDING = SAVE_BUTTON_HEIGHT + SAVE_BUTTON_BOTTOM + SAVE_BUTTON_CONTENT_GAP;

// 요일/비활성 상태에 따른 날짜 텍스트 색. 순수 함수라 모듈 레벨로 올려 렌더 콜백을 안정적으로 memo할 수 있게 한다.
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

interface Props extends Partial<StackScreenProps<TaskFormStackParamList, 'ROUTINE'>> {
  taskMode?: TaskModeType | null;
  navigation?: any;
  closeBottomSheet?: () => void;
  handleValidationChange?: (isValid: boolean) => void;
  setValue?: UseFormSetValue<taskFormSchemeType>;
  watch?: UseFormWatch<taskFormSchemeType>;
  formState?: FormState<taskFormSchemeType>;
}

type RoutineFormRefMethod = {
  handleCloseButton: () => void;
  handleSubmit: () => void;
};

const RoutineForm = forwardRef<RoutineFormRefMethod, Props>(
  (
    {
      navigation: propNavigation,
      route,
      taskMode = null,
      closeBottomSheet = () => {},
      setValue: propSetValue,
      watch: propWatch,
      formState: propFormState,
      handleValidationChange,
    },
    ref,
  ) => {
    const id = route?.params?.id || -1;
    const mode = route?.params?.mode || 'TODO';
    const isTodoMode = mode === 'TODO';
    const isRoutineEditScreen = ref === null;

    let navigationContext;
    let formContext;
    try {
      // TODO: ESLint 에러 수정 필요(hooks called conditionally) - form 컴포넌트 분리
      navigationContext = useNavigation();
      formContext = useFormContext<taskFormSchemeType>();
    } catch (error) {
      // Provider 밖에서 사용될 경우 무시
      navigationContext = null;
      formContext = null;
    }

    const navigation = propNavigation || navigationContext;
    const setValue = propSetValue || formContext?.setValue;
    const watch = propWatch || formContext?.watch;
    const formContextHandleSubmit = formContext?.handleSubmit;
    const formState = propFormState || formContext?.formState;
    const dirtyFields = formState?.dirtyFields || {};
    const isFieldChanged = Object.keys(dirtyFields).length > 0;

    if (!setValue || !watch) {
      throw new Error('Form 메서드(setValue, watch)를 참조할 수 없습니다.');
    }

    const { data: todoTaskData } = useFetchTodoTask({ todoTaskId: id }, { enabled: isTodoMode && id !== -1 });
    const { data: dowithTaskData } = useFetchDowithTask({ dowithTaskId: id }, { enabled: !isTodoMode && id !== -1 });
    const { mutate: updateTaskRoutine, isPending: isUpdateTaskRoutineLoading } = useUpdateTaskRoutine({
      navigation,
      mode,
      id,
    });

    const data = id !== -1 ? todoTaskData ?? dowithTaskData : null;

    const date = watch('date');
    const targetDateString = date;

    // current(초기 표시 월)는 마운트 후 바꾸지 않는다. current를 스와이프에 맞춰 바꾸면 라이브러리가 scrollToMonth를
    // 되걸어(에코) 관성과 충돌 → 월이 자동으로 왕복한다. 스와이프는 라이브러리 내부 상태로만 처리한다.
    const [currentDate] = useState(targetDateString);
    // 가로 페이징 CalendarList는 컨테이너 폭을 알아야 월 단위로 정확히 스냅된다. 편집화면·바텀시트 폭이 달라 onLayout으로 측정한다.
    const [calendarWidth, setCalendarWidth] = useState(0);
    // 보이는 달(스와이프 즉시 반영). wrapper 높이를 이 값으로 구동해 달 전환 시 높이가 곧바로 조정되게 한다.
    const [visibleMonth, setVisibleMonth] = useState(targetDateString);
    // 화살표(‹ ›)는 current를 바꾸지 않고 이 ref의 scrollToMonth로 명령형 스크롤 → 에코 루프 없이 이동한다.
    const calendarRef = useRef<CalendarListImperativeMethods>(null);

    // wrapper는 보이는 달의 주 수만큼만 노출(overflow로 클립)해 여백을 없앤다. 즉시 반영되도록 visibleMonth로 계산.
    const calendarWrapperHeight = useMemo(
      () => CALENDAR_HEADER_HEIGHT + getWeeksInMonth(visibleMonth) * CALENDAR_ROW_HEIGHT,
      [visibleMonth],
    );

    // 스와이프/화살표로 보이는 달이 바뀌면 높이만 즉시 갱신한다(current는 건드리지 않음).
    const handleVisibleMonthChange = useCallback((month: DateData) => {
      setVisibleMonth(month.dateString);
    }, []);

    // 화살표: 헤더의 현재 표시 월(baseDate) 기준으로 명령형 스크롤. current 변경이 아니라 에코 루프가 없다.
    const handleMoveMonth = useCallback((amount: number, baseDate: Date) => {
      calendarRef.current?.scrollToMonth(dayjs(baseDate).add(amount, 'month').format('YYYY-MM-DD'));
    }, []);
    // 투두 모드에서 사용하는 선택 기간 상태
    const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);
    const [selectedPrimaryCategory, setSelectedPrimaryCategory] = useState<TaskRoutineCycleEnumType | null>(null);
    const [selectedWeeklyDaySet, setSelectedWeeklyDaySet] = useState<Set<number>>(new Set());
    const [selectedMonthlyDaySet, setSelectedMonthlyDaySet] = useState<Set<number>>(new Set());
    const [expanded, setExpanded] = useState(true);
    const [isExcludeHolidays, setIsExcludeHolidays] = useState(false);

    const isValidDatePeriod = selectedEndDate !== null;
    const routineCondition = watch('routineCondition');

    // 등록한 루틴이 유효한지 검사하는 함수 (루틴 기간, 반복 패턴을 종류에 맞게 설정했는지)
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

    const isButtonDisabled = !isFieldChanged || !getIsValidRoutineCondition() || isUpdateTaskRoutineLoading;

    const onSubmit = (value: taskFormSchemeType) => {
      const { routineCondition } = value;

      if (!routineCondition.startDate || !routineCondition.endDate || !routineCondition.cycle) {
        console.error('일부 루틴 정보가 유효하지 않습니다.');
        return;
      }

      updateTaskRoutine({
        startDate: routineCondition.startDate,
        endDate: routineCondition.endDate,
        cycle: routineCondition.cycle,
        pattern: routineCondition.pattern,
        isExcludeHolidays: routineCondition.isExcludeHolidays,
      });
    };

    // 선택한 기간 마킹하는 함수
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

    // 스와이프 중 부모 재렌더로 매번 재계산/새 객체가 생기지 않도록 메모이즈(선택 기간이 바뀔 때만 갱신).
    const markedDates = useMemo(
      () => getMarkedPeriodDates(selectedEndDate),
      [selectedEndDate, routineCondition?.startDate, targetDateString],
    );

    const handleExcludeHolidays = (value: boolean) => {
      if (isRoutineEditScreen) {
        setValue('routineCondition.isExcludeHolidays', value, {
          shouldDirty: true,
          shouldTouch: true,
        });
      }
      setIsExcludeHolidays(value);
    };

    const initRoutineCondition = (data?: fetchTodoTaskResponseDataSchemeType | addTaskRequestSchemeType | null) => {
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

    // 닫기 버튼을 눌렀을 때 이미 루틴이 설정된 경우를 제외하고 모두 초기화
    const handleCloseButton = () => {
      // 등록하지 않은 상태일 때
      if (routineCondition.startDate === null || routineCondition.endDate === null || routineCondition.cycle === null) {
        initRoutineCondition();
        return;
      }

      // 상태 초기화가 필요한지 여부
      let isNeedInit = true;

      // 값은 설정했지만 등록하기 버튼을 누르지 않았을 경우 이전 값으로 모두 롤백
      if (routineCondition.endDate !== selectedEndDate) {
        setSelectedEndDate(routineCondition.endDate);
        isNeedInit = false;
      }

      if (routineCondition.cycle !== selectedPrimaryCategory) {
        if (routineCondition.cycle === TASK_ROUTINE_CYCLE_ENUM.enum.DAILY) {
          isNeedInit = false;
        }

        if (routineCondition.cycle === TASK_ROUTINE_CYCLE_ENUM.enum.WEEKLY) {
          setSelectedWeeklyDaySet(new Set<number>(routineCondition.pattern));
          setSelectedMonthlyDaySet(new Set());
          isNeedInit = false;
        }

        if (routineCondition.cycle === TASK_ROUTINE_CYCLE_ENUM.enum.MONTHLY) {
          setSelectedMonthlyDaySet(new Set<number>(routineCondition.pattern));
          setSelectedWeeklyDaySet(new Set());
          isNeedInit = false;
        }

        setSelectedPrimaryCategory(routineCondition.cycle);
      } else {
        if (routineCondition.cycle === TASK_ROUTINE_CYCLE_ENUM.enum.DAILY) {
          isNeedInit = false;
        }

        if (
          routineCondition.cycle === TASK_ROUTINE_CYCLE_ENUM.enum.WEEKLY &&
          routineCondition.pattern !== Array.from(selectedWeeklyDaySet)
        ) {
          setSelectedWeeklyDaySet(new Set<number>(routineCondition.pattern));
          isNeedInit = false;
        }

        if (
          routineCondition.cycle === TASK_ROUTINE_CYCLE_ENUM.enum.MONTHLY &&
          routineCondition.pattern !== Array.from(selectedMonthlyDaySet)
        ) {
          setSelectedMonthlyDaySet(new Set<number>(routineCondition.pattern));
          isNeedInit = false;
        }
      }

      if (routineCondition.isExcludeHolidays !== isExcludeHolidays) {
        setIsExcludeHolidays(routineCondition.isExcludeHolidays);
        isNeedInit = false;
      }

      if (isNeedInit) {
        initRoutineCondition();
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

    // 요일별 텍스트 색상 결정 함수
    const handleDayPress = useCallback(
      (date: DateData) => {
        /**
         * 날짜 선택이 유효하지 않은 경우
         * 1. 루틴 수정 스크린 - 선택한 날짜가 이미 루틴 종료일로 설정되어 있을 경우
         * 2. 루틴 등록 스크린 - 선택한 날짜가 등록한 날 기준으로 동일하거나 이전일 경우
         */
        if (
          (isRoutineEditScreen && date.dateString === routineCondition?.endDate) ||
          (!isRoutineEditScreen && dayjs(date.dateString).isSameOrBefore(targetDateString))
        ) {
          return;
        }

        setSelectedEndDate(prev => {
          // 선택한 종료일 재선택 시 미선택으로 초기화
          if (prev === date.dateString) {
            if (isRoutineEditScreen) {
              setValue('routineCondition.endDate', null, { shouldDirty: true, shouldTouch: true });
            }
            return null;
          }

          if (isRoutineEditScreen) {
            setValue('routineCondition.endDate', date.dateString, { shouldDirty: true, shouldTouch: true });
          }
          return date.dateString;
        });
      },
      [isRoutineEditScreen, routineCondition?.endDate, targetDateString, setValue],
    );

    const renderDayComponent = useCallback(
      ({ date, state, marking }: DayProps & { date?: DateData }) => {
        if (!date) {
          return null;
        }

        const textColor = getDayTextColor(date.dateString, state);
        const isDisabled = state === 'disabled';

        const isStartDay = marking?.startingDay;
        const isEndDay = marking?.endingDay;
        const isMiddleDay = marking?.color && !isStartDay && !isEndDay;
        const isSingleDay = isStartDay && isEndDay;

        const getBackgroundDayColor = (isTargetDay?: boolean) => {
          if (!isMiddleDay && !isTargetDay) {
            return 'transparent';
          }

          if (isTargetDay) {
            return theme.COLORS.GRAY_SCALE.GRAY_92;
          }

          return theme.COLORS.GRAY_SCALE.GRAY_96;
        };

        return (
          // 셀이 열 전체 폭을 채우게 해(flex:1) 캘린더 폭과 무관하게 기간 배경이 인접 셀과 항상 맞닿게 한다.
          <View style={styles.dayCell}>
            {/* 배경 레이어 - 간격을 넘어서 확장 */}
            {!isSingleDay && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: -5,
                  right: -5,
                  flexDirection: 'row',
                  overflow: 'visible',
                }}
              >
                {/* 왼쪽 절반 */}
                <View
                  style={{
                    flex: 1,
                    backgroundColor: getBackgroundDayColor(isEndDay),
                  }}
                />
                {/* 오른쪽 절반 */}
                <View
                  style={{
                    flex: 1,
                    backgroundColor: getBackgroundDayColor(isStartDay),
                  }}
                />
              </View>
            )}
            <Pressable
              onPress={() => handleDayPress(date)}
              disabled={isDisabled}
              style={[
                styles.dayButton,
                (isStartDay || isEndDay) && {
                  backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_92,
                  borderRadius: 18,
                },
              ]}
            >
              <Text style={[theme.TYPOGRAPHY.BODY_2, { color: textColor }]}>{date.day}</Text>
            </Pressable>
          </View>
        );
      },
      [handleDayPress],
    );

    const handleSubmit = () => {
      setValue('routineCondition', buildRoutineCondition());
      closeBottomSheet();
    };

    const handleExpanded = () => setExpanded(!expanded);

    const handlePrimaryCategory = (value: TaskRoutineCycleEnumType) => () => {
      // 선택한 반복 패턴이 매 주가 아닐 경우 선택한 요일 Set 초기화
      if (value !== TASK_ROUTINE_CYCLE_ENUM.enum.WEEKLY) {
        if (isRoutineEditScreen) {
          setValue('routineCondition.pattern', [], {
            shouldDirty: true,
            shouldTouch: true,
          });
        }
        setSelectedWeeklyDaySet(new Set());
      }

      // 선택한 반복 패턴이 매 월이 아닐 경우 선택한 일수 Set 초기화
      if (value !== TASK_ROUTINE_CYCLE_ENUM.enum.MONTHLY) {
        if (isRoutineEditScreen) {
          setValue('routineCondition.pattern', [], {
            shouldDirty: true,
            shouldTouch: true,
          });
        }
        setSelectedMonthlyDaySet(new Set());
      }

      setSelectedPrimaryCategory(value);
      if (isRoutineEditScreen) {
        setValue('routineCondition.cycle', value, {
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    };

    const renderCustomHeader = useCallback(
      (date: Date) => <CustomCalendarHeader type="NORMAL" date={date} onMoveMonth={handleMoveMonth} />,
      [handleMoveMonth],
    );

    useEffect(() => {
      initRoutineCondition(data);
    }, [taskMode, data]);

    useEffect(() => {
      const isValid = getIsValidRoutineCondition();
      handleValidationChange?.(isValid);
    }, [selectedEndDate, selectedPrimaryCategory, selectedWeeklyDaySet, selectedMonthlyDaySet]);

    useImperativeHandle(ref, () => ({
      handleSubmit,
      handleCloseButton,
    }));

    return (
      <>
        <ScrollView
          style={styles.container}
          contentContainerStyle={isRoutineEditScreen && { paddingHorizontal: 20, paddingBottom: SCROLL_BOTTOM_PADDING }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.dateSection}>
            <View style={styles.dateLeftSection}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={theme.TYPOGRAPHY.SUB_TITLE}>시작 날짜</Text>
                <Text style={[theme.TYPOGRAPHY.BODY_2]}>
                  {dayjs(routineCondition?.startDate || targetDateString).format('YYYY. MM. DD (ddd)')}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={theme.TYPOGRAPHY.SUB_TITLE}>종료 날짜</Text>
                <Text style={[theme.TYPOGRAPHY.BODY_2, !selectedEndDate && { color: theme.COLORS.GRAY_SCALE.GRAY_60 }]}>
                  {selectedEndDate ? dayjs(selectedEndDate).format('YYYY. MM. DD (ddd)') : '날짜를 선택해주세요'}
                </Text>
              </View>
            </View>
            <Pressable style={styles.dateRightSection} onPress={handleExpanded}>
              <DropArrow direction={expanded ? 'UP' : 'DOWN'} />
            </Pressable>
          </View>
          <Divider style={{ marginVertical: 20 }} />
          {expanded && (
            <View
              // 바깥 컨테이너 좌우 패딩(편집화면 20 / 바텀시트 24)을 살짝 상쇄해 달력을 조금 더 넓게 편다(과하면 잘림).
              style={{ marginBottom: 32, marginHorizontal: -8 }}
              onLayout={event => {
                const { width } = event.nativeEvent.layout;
                if (width > 0 && width !== calendarWidth) {
                  setCalendarWidth(width);
                }
              }}
            >
              {calendarWidth > 0 && (
                // 보이는 달 높이만큼만 노출(overflow 클립)해 여백 제거. visibleMonth로 즉시 반영돼 달 전환 지연이 없다.
                <View style={{ height: calendarWrapperHeight, overflow: 'hidden' }}>
                  <MemoizedCalendarList
                    ref={calendarRef}
                    current={currentDate}
                    // 가로 페이징으로 좌우 스와이프 시 월이 슬라이드 애니메이션과 함께 이동한다.
                    horizontal
                    pagingEnabled
                    // 헤더(화살표 포함)는 고정하고 달력 본문만 슬라이드시킨다.
                    staticHeader
                    calendarWidth={calendarWidth}
                    // 자체 높이는 최대(6주)로 고정 → 달 전환 시 CalendarList 재렌더/재측정 최소화(실제 노출은 wrapper가 클립).
                    calendarHeight={CALENDAR_LIST_MAX_HEIGHT}
                    // CalendarList 기본 좌우 패딩(15)은 제거하고, 헤더는 본문(week 자체 패딩 15)에 맞춰 정렬한다.
                    calendarStyle={CALENDAR_LIST_STYLE}
                    headerStyle={CALENDAR_HEADER_STYLE}
                    pastScrollRange={12}
                    futureScrollRange={24}
                    markingType={'period'}
                    markedDates={markedDates}
                    minDate={targetDateString}
                    renderHeader={renderCustomHeader}
                    onDayPress={handleDayPress}
                    dayComponent={renderDayComponent}
                    // 보이는 달이 바뀌면 wrapper 높이만 즉시 갱신(current는 건드리지 않아 에코 없음).
                    onMonthChange={handleVisibleMonthChange}
                    hideDayNames
                    hideArrows
                  />
                </View>
              )}
            </View>
          )}
          <View style={styles.routineSection}>
            <Text style={styles.routineSectionTitle}>반복 패턴</Text>
            <View style={styles.routinePrimaryCategoryButtonSection}>
              <Pressable
                style={[
                  styles.routinePrimaryCategoryButton,
                  selectedPrimaryCategory === TASK_ROUTINE_CYCLE_ENUM.enum.DAILY && {
                    borderColor: theme.COLORS.DEFAULT.BLACK,
                  },
                ]}
                onPress={handlePrimaryCategory(TASK_ROUTINE_CYCLE_ENUM.enum.DAILY)}
              >
                <Text style={styles.routinePrimaryCategoryButtonText}>매일</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.routinePrimaryCategoryButton,
                  selectedPrimaryCategory === TASK_ROUTINE_CYCLE_ENUM.enum.WEEKLY && {
                    borderColor: theme.COLORS.DEFAULT.BLACK,
                  },
                ]}
                onPress={handlePrimaryCategory(TASK_ROUTINE_CYCLE_ENUM.enum.WEEKLY)}
              >
                <Text style={styles.routinePrimaryCategoryButtonText}>매 주</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.routinePrimaryCategoryButton,
                  selectedPrimaryCategory === TASK_ROUTINE_CYCLE_ENUM.enum.MONTHLY && {
                    borderColor: theme.COLORS.DEFAULT.BLACK,
                  },
                ]}
                onPress={handlePrimaryCategory(TASK_ROUTINE_CYCLE_ENUM.enum.MONTHLY)}
              >
                <Text style={styles.routinePrimaryCategoryButtonText}>매 월</Text>
              </Pressable>
            </View>
            {selectedPrimaryCategory === TASK_ROUTINE_CYCLE_ENUM.enum.WEEKLY && (
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {WEEKLY_DAY_INFO.map(({ code, value, name }) => (
                  <Pressable
                    key={code}
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: 38,
                      borderRadius: 8,
                      backgroundColor: selectedWeeklyDaySet.has(value)
                        ? theme.COLORS.GRAY_SCALE.GRAY_30
                        : theme.COLORS.GRAY_SCALE.GRAY_96,
                    }}
                    onPress={() => {
                      setSelectedWeeklyDaySet(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(value)) {
                          newSet.delete(value);
                        } else {
                          newSet.add(value);
                        }

                        if (isRoutineEditScreen) {
                          setValue('routineCondition.pattern', Array.from(newSet), {
                            shouldDirty: true,
                            shouldTouch: true,
                          });
                        }
                        return newSet;
                      });
                    }}
                  >
                    <Text
                      style={{
                        color: selectedWeeklyDaySet.has(value)
                          ? theme.COLORS.DEFAULT.WHITE
                          : theme.COLORS.DEFAULT.BLACK,
                      }}
                    >
                      {name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
            {selectedPrimaryCategory === TASK_ROUTINE_CYCLE_ENUM.enum.MONTHLY && (
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {Array.from({ length: 32 }, (_, index) => (
                  <Pressable
                    key={index + 1}
                    style={{
                      // TODO: % 단위 말고 다른 방법으로 구현 필요
                      width: index !== 31 ? '12.2857%' : '54.1429%',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: 38,
                      borderRadius: 8,
                      backgroundColor: selectedMonthlyDaySet.has(index + 1)
                        ? theme.COLORS.GRAY_SCALE.GRAY_30
                        : theme.COLORS.GRAY_SCALE.GRAY_96,
                    }}
                    onPress={() => {
                      setSelectedMonthlyDaySet(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(index + 1)) {
                          newSet.delete(index + 1);
                        } else {
                          newSet.add(index + 1);
                        }

                        if (isRoutineEditScreen) {
                          setValue('routineCondition.pattern', Array.from(newSet), {
                            shouldDirty: true,
                            shouldTouch: true,
                          });
                        }
                        return newSet;
                      });
                    }}
                  >
                    <Text
                      style={{
                        color: selectedMonthlyDaySet.has(index + 1)
                          ? theme.COLORS.DEFAULT.WHITE
                          : theme.COLORS.DEFAULT.BLACK,
                      }}
                    >
                      {index < 31 ? index + 1 : '마지막 날'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
          <View style={styles.selectHolidaySection}>
            <View style={styles.selectHolidayTitleWrap}>
              <Text style={theme.TYPOGRAPHY.SUB_TITLE}>공휴일 제외하기</Text>
              <Text style={[theme.TYPOGRAPHY.CAPTION1_BASIC, { color: theme.COLORS.GRAY_SCALE.GRAY_70 }]}>(선택)</Text>
            </View>
            <Switch
              value={isExcludeHolidays}
              color={theme.COLORS.PRIMARY.RED_60}
              onValueChange={handleExcludeHolidays}
            />
          </View>
        </ScrollView>
        {isRoutineEditScreen && (
          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, !isButtonDisabled && { backgroundColor: theme.COLORS.PRIMARY.RED_60 }]}
              disabled={isButtonDisabled}
              onPress={formContextHandleSubmit?.(onSubmit)}
            >
              <Text
                style={[
                  theme.TYPOGRAPHY.TITLE_2,
                  { color: theme.COLORS.DEFAULT.WHITE },
                  isUpdateTaskRoutineLoading && {
                    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_80,
                  },
                ]}
              >
                저장하기
              </Text>
            </Pressable>
          </View>
        )}
      </>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
  },
  dateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateLeftSection: {
    gap: 8,
    flex: 8,
  },
  dateRightSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
  },
  routineSection: {
    gap: 12,
  },
  routineSectionTitle: theme.TYPOGRAPHY.SUB_TITLE,
  routinePrimaryCategoryButtonSection: { flexDirection: 'row', gap: 8 },
  routinePrimaryCategoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_92,
  },
  routinePrimaryCategoryButtonText: theme.TYPOGRAPHY.SUB_TITLE,
  selectHolidaySection: {
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // 라이브러리 dayContainer(flex:1, column)의 가로 폭을 채운다(alignSelf:stretch). flex:1은 세로로 늘어나 붕괴하므로 금지.
  dayCell: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  dayButton: {
    height: 36,
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  selectHolidayTitleWrap: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  /*
   * 버튼이 ScrollView 위에 떠 있어, 바운스 스크롤 시 버튼 주변(좌우 여백·아래 공간)으로
   * 컨텐츠가 비친다. 화면 폭 전체를 덮는 흰 배경 컨테이너로 가린다.
   */
  buttonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: SAVE_BUTTON_BOTTOM,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
  },
  button: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: SAVE_BUTTON_HEIGHT,
    backgroundColor: theme.COLORS.PRIMARY.RED_92,
  },
  buttonText: {
    ...theme.TYPOGRAPHY.TITLE_2,
    color: theme.COLORS.DEFAULT.WHITE,
  },
});

export type { RoutineFormRefMethod };
export { RoutineForm };
