import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Divider, Switch } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import type { DateData, MarkedDates } from 'react-native-calendars/src/types';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
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

dayjs.extend(isSameOrBefore);

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

    const { data: todoTaskData } = useFetchTodoTask({ todoTaskId: id }, { enabled: mode === 'TODO' && id !== -1 });
    const { data: dowithTaskData } = useFetchDowithTask(
      { dowithTaskId: id },
      { enabled: mode === 'DOWITH' && id !== -1 },
    );
    const { mutate: updateTaskRoutine, isPending: isUpdateTaskRoutineLoading } = useUpdateTaskRoutine({
      navigation,
      mode,
      id,
    });

    const data = id !== -1 ? todoTaskData ?? dowithTaskData : null;
    const isButtonDisabled = !isFieldChanged || isUpdateTaskRoutineLoading;

    const todayDateString = dayjs().format('YYYY-MM-DD');
    const [currentDate, setCurrentDate] = useState(todayDateString);
    // 투두 모드에서 사용하는 선택 기간 상태
    const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);
    const [selectedPrimaryCategory, setSelectedPrimaryCategory] = useState<TaskRoutineCycleEnumType | null>(null);
    const [selectedWeeklyDaySet, setSelectedWeeklyDaySet] = useState<Set<number>>(new Set());
    const [selectedMonthlyDaySet, setSelectedMonthlyDaySet] = useState<Set<number>>(new Set());
    const [expanded, setExpanded] = useState(true);
    const [isExcludeHolidays, setIsExcludeHolidays] = useState(false);

    const isValidDatePeriod = selectedStartDate !== null && selectedEndDate !== null;
    const routineCondition = watch('routineCondition');

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

    // 선택한 기간 마킹하는 함수
    const getMarkedPeriodDates = (start: string | null, end: string | null): MarkedDates => {
      if (!start) {
        return {};
      }

      const startDate = dayjs(start);

      // 종료일 없으면 단일 선택 마킹
      if (!end) {
        const single = startDate.format('YYYY-MM-DD');
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

      // 날짜 순서 보정
      const from = startDate.isBefore(endDate) ? startDate : endDate;
      const to = startDate.isBefore(endDate) ? endDate : startDate;

      const marked: MarkedDates = {};

      let current = from;
      let index = 0;
      const totalDays = to.diff(from, 'day') + 1;

      while (current.isSameOrBefore(to, 'day')) {
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

    const handleExcludeHolidays = (value: boolean) => setIsExcludeHolidays(value);

    const initRoutineCondition = (data?: fetchTodoTaskResponseDataSchemeType | addTaskRequestSchemeType | null) => {
      const getSelectedDaySet = (type: Exclude<TaskRoutineCycleEnumType, 'DAILY'>) => {
        const cycle = data?.routineCondition?.cycle;
        if (!data || cycle === TASK_ROUTINE_CYCLE_ENUM.enum.DAILY) {
          return new Set<number>();
        }

        if (type === cycle) {
          return new Set<number>(routineCondition.pattern);
        }

        return new Set<number>();
      };

      // TODO: 투두 생성 시, 루틴을 이미 설정해서 저장해놓았다면 해당 상태로 초기화 필요

      setSelectedStartDate(data?.routineCondition?.startDate ?? null);
      setSelectedEndDate(data?.routineCondition?.endDate ?? null);
      setIsExcludeHolidays(data?.routineCondition?.isExcludeHolidays ?? false);
      setSelectedPrimaryCategory(data?.routineCondition?.cycle ?? null);
      setSelectedWeeklyDaySet(getSelectedDaySet(TASK_ROUTINE_CYCLE_ENUM.enum.WEEKLY));
      setSelectedMonthlyDaySet(getSelectedDaySet(TASK_ROUTINE_CYCLE_ENUM.enum.MONTHLY));
      setExpanded(true);

      setValue('routineCondition', {
        startDate: data?.routineCondition?.startDate ?? null,
        endDate: data?.routineCondition?.endDate ?? null,
        cycle: data?.routineCondition?.cycle ?? null,
        pattern: data?.routineCondition?.pattern ?? [],
        isExcludeHolidays: data?.routineCondition?.isExcludeHolidays ?? false,
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

      /*
      값은 설정했지만 등록하기 버튼을 누르지 않았을 경우 이전 값으로 모두 롤백
     */
      if (routineCondition.startDate !== selectedStartDate) {
        setSelectedStartDate(routineCondition.startDate);
        isNeedInit = false;
      }

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
      startDate: selectedStartDate,
      endDate: selectedEndDate,
      cycle: selectedPrimaryCategory,
      pattern: getPattern(),
      isExcludeHolidays,
    });

    const handleSubmit = () => {
      setValue('routineCondition', buildRoutineCondition());
      closeBottomSheet();
    };

    const handleExpanded = () => {
      if (expanded) {
        setSelectedStartDate(null);
        setSelectedEndDate(null);
      }
      setExpanded(!expanded);
    };

    const handlePrimaryCategory = (value: TaskRoutineCycleEnumType) => () => {
      // 선택한 반복 패턴이 매 주가 아닐 경우 선택한 요일 Set 초기화
      if (value !== TASK_ROUTINE_CYCLE_ENUM.enum.WEEKLY) {
        setSelectedWeeklyDaySet(new Set());
      }

      // 선택한 반복 패턴이 매 월이 아닐 경우 선택한 일수 Set 초기화
      if (value !== TASK_ROUTINE_CYCLE_ENUM.enum.MONTHLY) {
        setSelectedMonthlyDaySet(new Set());
      }

      setSelectedPrimaryCategory(value);
    };

    const handleDayPress = (date: DateData) => {
      // 선택한 날짜가 없을 경우 시작날짜로 지정
      if (!selectedStartDate) {
        setSelectedStartDate(date.dateString);
        return;
      }

      // 선택한 날짜(date.dateString)가 selectedStartDate보다 빠른 경우 시작날짜 재지정 및 종료날짜 초기화
      if (dayjs(date.dateString).isBefore(dayjs(selectedStartDate))) {
        setSelectedStartDate(date.dateString);
        setSelectedEndDate(null);
        return;
      }

      setSelectedEndDate(date.dateString);
    };

    const renderCustomHeader = (date: Date) => (
      <CustomCalendarHeader type="NORMAL" date={date} setCurrentDate={setCurrentDate} />
    );

    useEffect(() => {
      initRoutineCondition(data);
    }, [taskMode, data]);

    useEffect(() => {
      const isValid = getIsValidRoutineCondition();
      handleValidationChange?.(isValid);
    }, [selectedStartDate, selectedEndDate, selectedPrimaryCategory, selectedWeeklyDaySet, selectedMonthlyDaySet]);

    useEffect(() => {
      setValue('routineCondition', buildRoutineCondition(), {
        shouldDirty: true,
        shouldTouch: true,
      });
    }, [
      setValue,
      selectedStartDate,
      selectedEndDate,
      selectedPrimaryCategory,
      selectedWeeklyDaySet,
      selectedMonthlyDaySet,
      isExcludeHolidays,
    ]);

    useImperativeHandle(ref, () => ({
      handleSubmit,
      handleCloseButton,
    }));

    return (
      <>
        <ScrollView
          style={styles.container}
          contentContainerStyle={ref === null && { paddingHorizontal: 20, paddingBottom: 134 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.dateSection}>
            <View style={styles.dateLeftSection}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={theme.TYPOGRAPHY.SUB_TITLE}>시작 날짜</Text>
                <Text
                  style={[theme.TYPOGRAPHY.BODY_2, !selectedStartDate && { color: theme.COLORS.GRAY_SCALE.GRAY_60 }]}
                >
                  {selectedStartDate ? dayjs(selectedStartDate).format('YYYY. MM. DD (ddd)') : '날짜를 선택해주세요'}
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
            <Calendar
              initialDate={currentDate}
              style={{ marginBottom: 32 }}
              markingType={'period'}
              markedDates={getMarkedPeriodDates(selectedStartDate, selectedEndDate)}
              minDate={todayDateString}
              renderHeader={renderCustomHeader}
              onDayPress={handleDayPress}
              hideArrows
            />
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
        {ref === null && (
          <Pressable
            style={[
              styles.button,
              { bottom: isAos ? 20 : getBottomSpace() },
              !isButtonDisabled && { backgroundColor: theme.COLORS.PRIMARY.RED_60 },
            ]}
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
  selectHolidayTitleWrap: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  button: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: 64,
    backgroundColor: theme.COLORS.PRIMARY.RED_95,
  },
  buttonText: {
    fontSize: 18,
    color: theme.COLORS.DEFAULT.WHITE,
  },
});

export type { RoutineFormRefMethod };
export { RoutineForm };
