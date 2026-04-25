import React, { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import dayjs from 'dayjs';
import { Divider } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarProvider, ExpandableCalendar } from 'react-native-calendars';
import { Positions } from 'react-native-calendars/src/expandableCalendar';
import type { DateData } from 'react-native-calendars/src/types';
import type { DayProps } from 'react-native-calendars/src/calendar/day';
import { Shadow } from 'react-native-shadow-2';
import LinearGradient from 'react-native-linear-gradient';

import { theme } from 'styles/theme';
import { ArrowRight } from 'components/common/icons/ArrowIcon';
import { PlusIcon } from 'components/common/icons/PlusIcon';
import { ListContainerView } from 'components/Task/ListContainerView';
import type { HomeTabScreenProps } from 'types/shared';
import { FeedbackNotification } from 'components/common/icons/FeedbackNotification';
import { CustomCalendarHeader } from 'components/Task';
import { TaskStatusMarking } from 'components/common/icons/TaskStatusMarking';
import { useFetchTaskList } from 'hooks/queries/task/useFetchTaskList';
import { useScheduledRefetch } from 'hooks/shared/useScheduledRefetch';
import { TASK_QUERY_KEY } from 'constants/queries';
import { TASK_STATUS_ENUM } from 'schemes/task/enum';
import { TASK_STATUS } from 'constants/Task';
import type { fetchTaskListResponseSchemeDataType } from 'types/task/scheme/api';

// 요일 시작: 0=일, 1=월
const FIRST_DAY = 0;

const Home = ({ navigation: { navigate } }: HomeTabScreenProps<'MYTODO'>) => {
  const { top } = useSafeAreaInsets();

  // 정시 기준 5분 간격(1분, 6분, ..., 56분)으로 TaskList 자동 refetch
  useScheduledRefetch([TASK_QUERY_KEY.LIST]);

  const todayDateString = dayjs().format('YYYY-MM-DD');
  const [currentDate, setCurrentDate] = useState(todayDateString);
  const [selectedDate, setSelectedDate] = useState(todayDateString);
  const [isWeekView, setIsWeekView] = useState(true);
  const selectedDateKoreanString = dayjs(selectedDate).format('YYYY년 MM월 DD일 dddd');

  const year = dayjs(selectedDate).year();
  const month = dayjs(selectedDate).month() + 1;
  const yearMonth = useMemo(() => ({ year, month }), [year, month]);

  const { data: taskList } = useFetchTaskList(yearMonth);
  const selectedDateTaskList = taskList
    ? {
        dowithTasks: taskList.dowithTasks.filter(task => task.date === selectedDate),
        todoTasks: taskList.todoTasks.filter(task => task.date === selectedDate),
      }
    : null;

  const handleBadge = () => {
    console.log('대표 뱃지 클릭');
  };

  const handlePressNotification = () => {
    navigate('FEEDBACK');
  };

  const handlePressPlusIcon = () => {
    navigate('TASK_FORM', { date: selectedDate, screen: 'COMMON' });
  };

  const handleDayPress = (date?: DateData) => () => {
    if (!date) {
      return;
    }

    setSelectedDate(date.dateString);
  };

  const startOfWeek = (targetDay: dayjs.Dayjs, firstDay: number) => {
    const diff = (targetDay.day() - firstDay + 7) % 7;
    return targetDay.subtract(diff, 'day');
  };

  // 월뷰에서 실제로 "보이는 마지막 주" 7일(압축 규칙 반영)
  const getLastVisibleWeekDates = (current: string, firstDay: number) => {
    // 달의 마지막 날
    const end = dayjs(current).endOf('month');
    // 압축되면 직전 주가 마지막 줄
    const base = end.day() === firstDay ? end.subtract(1, 'day') : end;
    const start = startOfWeek(base, firstDay);
    return Array.from({ length: 7 }, (_, i) => start.add(i, 'day').format('YYYY-MM-DD'));
  };

  // 이번 달이 화면에 몇 줄로 보이는지 계산
  const getWeeksCount = (current: string, firstDay: number) => {
    const currentDate = dayjs(current);
    const gridStart = startOfWeek(currentDate.startOf('month'), firstDay);
    // 마지막 보이는 토/일까지
    const gridEnd = startOfWeek(currentDate.endOf('month'), firstDay).add(6, 'day');
    return Math.round(gridEnd.diff(gridStart, 'day') / 7) + 1;
  };

  const hasIconOnDates = (dates: string[], taskList?: fetchTaskListResponseSchemeDataType) =>
    !!taskList &&
    dates.some(
      date =>
        taskList.dowithTasks.some(task => task.date === date) || taskList.todoTasks.some(task => task.date === date),
    );

  const getCalendarMarginBottom = () => {
    // 주간 보기
    if (isWeekView) {
      const weekStart = startOfWeek(dayjs(currentDate), FIRST_DAY);
      const weekDates = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day').format('YYYY-MM-DD'));
      return hasIconOnDates(weekDates, taskList) ? 30 : 0;
    }

    // 월간 보기
    const lastWeekDates = getLastVisibleWeekDates(currentDate, FIRST_DAY);
    const weeks = getWeeksCount(currentDate, FIRST_DAY); // 5 또는 6
    const lastRowHasIcon = hasIconOnDates(lastWeekDates, taskList);

    if (weeks === 7) {
      return lastRowHasIcon ? 10 : -10;
    } else {
      return lastRowHasIcon ? -40 : -60;
    }
  };

  const getTaskStatus = useCallback((taskList: fetchTaskListResponseSchemeDataType) => {
    const { dowithTasks, todoTasks } = taskList;
    const isDowithSuccessStatusExisted = dowithTasks.some(({ status }) => status === TASK_STATUS_ENUM.enum.SUCCESS);
    const isDowithFailStatusALL = dowithTasks.every(({ status }) => status === TASK_STATUS_ENUM.enum.FAIL);
    const isDowithSuccessStatusALL = dowithTasks.every(({ status }) => status === TASK_STATUS_ENUM.enum.SUCCESS);
    const isDowithWaitStatusALL = dowithTasks.every(({ status }) => status === TASK_STATUS_ENUM.enum.WAIT);
    const isTodoSuccessStatusExisted = todoTasks.some(({ status }) => status === TASK_STATUS_ENUM.enum.SUCCESS);
    const isTodoFailStatusALL = todoTasks.every(({ status }) => status === TASK_STATUS_ENUM.enum.FAIL);
    const isTodoSuccessStatusALL = todoTasks.every(({ status }) => status === TASK_STATUS_ENUM.enum.SUCCESS);
    const isTodoWaitStatusALL = todoTasks.every(({ status }) => status === TASK_STATUS_ENUM.enum.WAIT);

    // 모든 종류의 task가 등록된 경우
    if (dowithTasks.length > 0 && todoTasks.length > 0) {
      // 모든 종류의 task가 실패 상태일 경우
      if (isDowithFailStatusALL && isTodoFailStatusALL) {
        return TASK_STATUS.ALL_FAIL;
      }

      // 모든 종류의 task가 성공 상태일 경우
      if (isDowithSuccessStatusALL && isTodoSuccessStatusALL) {
        return TASK_STATUS.ALL_SUCCESS;
      }

      // task가 모두 대기 상태일 경우
      if (isDowithWaitStatusALL && isTodoWaitStatusALL) {
        return TASK_STATUS.ALL_WAIT;
      }

      // 등록한 task 중 성공 상태가 존재할 경우
      if (isDowithSuccessStatusExisted || isTodoSuccessStatusExisted) {
        return TASK_STATUS.ALL_SOME_SUCCESS;
      }

      return TASK_STATUS.NONE;
    }

    // 두윗 Task만 등록된 경우
    if (dowithTasks.length > 0 && todoTasks.length === 0) {
      // 두윗 task가 모두 실패 상태일 경우
      if (isDowithFailStatusALL) {
        return TASK_STATUS.DOWITH_FAIL;
      }

      // 두윗 task가 모두 성공 상태일 경우
      if (isDowithSuccessStatusALL) {
        return TASK_STATUS.DOWITH_SUCCESS;
      }

      // 두윗 task가 모두 대기 상태일 경우
      if (isDowithWaitStatusALL) {
        return TASK_STATUS.DOWITH_WAIT;
      }

      // 등록한 두윗 task 중 성공 상태가 존재할 경우
      if (isDowithSuccessStatusExisted) {
        return TASK_STATUS.DOWITH_SOME_SUCCESS;
      }

      return TASK_STATUS.NONE;
    }

    // 투두 Task만 등록된 경우
    if (dowithTasks.length === 0 && todoTasks.length > 0) {
      // 투두 task를 모두 실패했을 경우
      if (isTodoFailStatusALL) {
        return TASK_STATUS.TODO_FAIL;
      }

      // 투두 task를 모두 성공했을 경우
      if (isTodoSuccessStatusALL) {
        return TASK_STATUS.TODO_SUCCESS;
      }

      // 투두 task가 모두 대기 상태일 경우
      if (isTodoWaitStatusALL) {
        return TASK_STATUS.TODO_WAIT;
      }

      // 등록한 투두 task 중 성공 상태가 존재할 경우
      if (isTodoSuccessStatusExisted) {
        return TASK_STATUS.TODO_SOME_SUCCESS;
      }

      return TASK_STATUS.NONE;
    }

    // Task가 등록되지 않았을 경우
    return TASK_STATUS.NONE;
  }, []);

  const renderDayComponent = ({
    date,
    state,
  }: // marking,
  DayProps & {
    date?: DateData;
  }) => {
    // const isToday = date?.dateString === todayDateString;
    const targetDayTaskList = {
      dowithTasks: taskList?.dowithTasks.filter(task => task.date === date?.dateString) ?? [],
      todoTasks: taskList?.todoTasks.filter(task => task.date === date?.dateString) ?? [],
    };

    const { dowithTasks, todoTasks } = targetDayTaskList;

    // 등록한 Task가 있어야만 task 상태 마킹 노출
    const isStatusMarkingVisible = todoTasks.length > 0 || dowithTasks.length > 0;

    return (
      <View style={styles.dayWrap}>
        <TouchableOpacity
          style={[styles.calendarDay, date?.dateString === selectedDate && styles.selectedDay]}
          onPress={handleDayPress(date)}
        >
          <View>
            <Text
              style={[
                theme.TYPOGRAPHY.CAPTION_2,
                date?.dateString === selectedDate && styles.selectedDayText,
                state === 'disabled' && { color: theme.COLORS.GRAY_SCALE.GRAY_80 },
              ]}
            >
              {date?.day}
            </Text>
          </View>
        </TouchableOpacity>
        {isStatusMarkingVisible && <TaskStatusMarking status={getTaskStatus(targetDayTaskList)} />}
      </View>
    );
  };

  const renderCustomHeader = (date: Date) => (
    <CustomCalendarHeader
      type="EXPANDABLE"
      date={date}
      selectedDate={selectedDate}
      isWeekView={isWeekView}
      setIsWeekView={setIsWeekView}
      setCurrentDate={setCurrentDate}
      setSelectedDate={setSelectedDate}
    />
  );

  return (
    <>
      <View style={{ height: top }} />
      <View style={styles.container}>
        <LinearGradient
          colors={[theme.COLORS.DEFAULT.WHITE, theme.COLORS.GRAY_SCALE.GRAY_96, theme.COLORS.STATUS.GREEN_90]}
          locations={[0, 0.8, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ paddingHorizontal: 20 }}
        >
          <View style={styles.profile}>
            <View style={styles.iconWrap}>
              <Pressable style={styles.notificationWrap} onPress={handlePressNotification}>
                <FeedbackNotification />
                <Text style={[theme.TYPOGRAPHY.BODY_2, { color: theme.COLORS.GRAY_SCALE.GRAY_50 }]}>잔소리</Text>
                <ArrowRight fill={theme.COLORS.GRAY_SCALE.GRAY_80} />
              </Pressable>
            </View>
            <View style={styles.profileContent}>
              <Pressable onPress={handleBadge}>
                <Image
                  style={styles.badgeImage}
                  source={{
                    uri: 'https://ichef.bbci.co.uk/news/1536/cpsprodpb/16620/production/_91408619_55df76d5-2245-41c1-8031-07a4da3f313f.jpg.webp',
                  }}
                />
              </Pressable>
              <View style={styles.titleWrap}>
                <Text style={styles.title}>고단한 감자</Text>
                <Text style={[theme.TYPOGRAPHY.BODY_2, { color: theme.COLORS.GRAY_SCALE.GRAY_50 }]}>
                  안녕하세요 갓생감자입니다
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
        <Shadow
          startColor="rgba(0, 0, 0, 0.05)"
          distance={10}
          offset={[0, -4]}
          containerStyle={{
            borderTopStartRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          <View style={styles.contentWrap}>
            <View style={{ flex: 1 }}>
              <CalendarProvider style={styles.calendarWrap} date={currentDate}>
                <ExpandableCalendar
                  key={isWeekView ? 'isWeekView' : 'monthView'}
                  initialPosition={isWeekView ? Positions.CLOSED : Positions.OPEN}
                  markedDates={{
                    [selectedDate]: { selected: true },
                  }}
                  firstDay={FIRST_DAY}
                  dayComponent={renderDayComponent}
                  renderHeader={renderCustomHeader}
                  closeOnDayPress={false}
                  allowShadow={false}
                  hideArrows
                  hideKnob
                  disablePan
                />
                <View style={{ marginBottom: getCalendarMarginBottom() }} />
                <View style={{ flex: 1, marginHorizontal: 20 }}>
                  <Divider style={styles.divider} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={theme.TYPOGRAPHY.CAPTION1_BASIC}>{selectedDateKoreanString}</Text>
                    <TouchableOpacity style={{ paddingLeft: 8, paddingBottom: 8 }} onPress={handlePressPlusIcon}>
                      <PlusIcon />
                    </TouchableOpacity>
                  </View>
                  {selectedDateTaskList ? (
                    <View style={{ flex: 1, marginTop: 16 }}>
                      <ListContainerView
                        year={year}
                        month={month}
                        taskList={selectedDateTaskList}
                        selectedDate={selectedDate}
                      />
                    </View>
                  ) : null}
                </View>
              </CalendarProvider>
            </View>
          </View>
        </Shadow>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.STATUS.GREEN_90,
  },
  profile: {
    gap: 16,
    paddingTop: 20,
    paddingBottom: 24,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  iconWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  notificationWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  profileContent: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  titleWrap: {
    gap: 2,
  },
  title: theme.TYPOGRAPHY.TITLE_3,
  contentWrap: {
    flex: 1,
    gap: 12,
    borderTopStartRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
    padding: 20,
  },
  calendarWrap: {
    marginHorizontal: -20,
  },
  calendarDay: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayWrap: {
    alignItems: 'center',
  },
  selectedDay: {
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_40,
    padding: 8,
    borderRadius: 14,
  },
  selectedDayText: {
    color: theme.COLORS.DEFAULT.WHITE,
  },
  divider: {
    borderWidth: 0.5,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_92,
    marginTop: 12,
    marginBottom: 24,
  },
});
export { Home };
