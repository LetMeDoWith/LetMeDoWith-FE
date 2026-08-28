import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import dayjs from 'dayjs';
import { Divider } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarProvider, ExpandableCalendar } from 'react-native-calendars';
import { Positions } from 'react-native-calendars/src/expandableCalendar';
import type { DateData } from 'react-native-calendars/src/types';
import type { DayProps } from 'react-native-calendars/src/calendar/day';
import LinearGradient from 'react-native-linear-gradient';

import { theme } from 'styles/theme';
import { ProfileImage } from 'components/common/ProfileImage';
import { ArrowRight } from 'components/common/icons/ArrowIcon';
import { PlusIcon } from 'components/common/icons/PlusIcon';
import { ListContainerView } from 'components/Task/ListContainerView';
import type { HomeTabScreenProps } from 'types/shared';
import { FeedbackNotification } from 'components/common/icons/FeedbackNotification';
import { CustomCalendarHeader } from 'components/Task';
import { TaskStatusMarking } from 'components/common/icons/TaskStatusMarking';
import { useFetchTaskList } from 'hooks/queries/task/useFetchTaskList';
import { useFetchMyDowithInfo } from 'hooks/queries/member/useFetchMyDowithInfo';
import { useScheduledRefetch } from 'hooks/shared/useScheduledRefetch';
import { TASK_QUERY_KEY } from 'constants/queries';
import { TASK_STATUS_ENUM } from 'schemes/task/enum';
import { TASK_STATUS } from 'constants/Task';
import type { fetchTaskListResponseSchemeDataType } from 'types/task/scheme/api';

// 요일 시작: 0=일, 1=월
const FIRST_DAY = 0;

// 날짜(24) + gap(2) + 마킹(21). 마킹 없어도 예약해 셀 높이를 균일하게.
const DAY_CELL_HEIGHT = 47;

// patch의 WEEK_HEIGHT와 동일. openHeight가 항상 6주 크기라, 주 수가 적은 달은 (6-주수)×이만큼 음수로 상쇄한다.
const WEEK_HEIGHT_PX = 61;
// 월뷰 하단 여백(6주 달 기준). 이 값만 조절하면 모든 달에 반영된다.
const MONTH_VIEW_BASE_MARGIN = 12;
const WEEK_VIEW_BOTTOM_MARGIN = 8;

// 태스크가 없는 날짜 조회 시 매번 새 객체를 만들지 않도록 공유하는 빈 목록
const EMPTY_TASK_LIST: fetchTaskListResponseSchemeDataType = { dowithTasks: [], todoTasks: [] };

type MarkingStatus = React.ComponentProps<typeof TaskStatusMarking>['status'];

interface CalendarDayProps {
  day?: number;
  dateString?: string;
  isSelected: boolean;
  isDisabled: boolean;
  status: MarkingStatus | null;
  onPress: (dateString?: string) => void;
}

// 날짜 셀을 memo로 분리해, 다른 날짜 선택/달 이동 시 값이 바뀐 셀만 재렌더되게 한다(마킹 SVG 재렌더 최소화).
const CalendarDay = memo(({ day, dateString, isSelected, isDisabled, status, onPress }: CalendarDayProps) => (
  <TouchableOpacity style={styles.dayWrap} onPress={() => onPress(dateString)}>
    <View style={[styles.calendarDay, isSelected && styles.selectedDay]}>
      <Text
        style={[theme.TYPOGRAPHY.CAPTION_2, isSelected && styles.selectedDayText, isDisabled && styles.disabledDayText]}
      >
        {day}
      </Text>
    </View>
    {status && <TaskStatusMarking status={status} />}
  </TouchableOpacity>
));
CalendarDay.displayName = 'CalendarDay';

const Home = ({ route, navigation: { navigate, setParams } }: HomeTabScreenProps<'MYTODO'>) => {
  const { top } = useSafeAreaInsets();

  // 정시 기준 5분 간격(1분, 6분, ..., 56분)으로 TaskList 자동 refetch
  useScheduledRefetch([TASK_QUERY_KEY.LIST]);

  const todayDateString = dayjs().format('YYYY-MM-DD');

  // 딥링크(letmedowith://home?date=YYYY-MM-DD)로 전달된 날짜. 형식이 어긋나도 필터/달력이 깨지지 않도록 정규화
  const deepLinkDate = route.params?.date;
  const initialDate = deepLinkDate ? dayjs(deepLinkDate).format('YYYY-MM-DD') : todayDateString;
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  // 앱이 이미 실행 중(홈 마운트 상태)일 때 딥링크로 재진입하면 파라미터 변화를 상태에 반영
  useEffect(() => {
    if (!deepLinkDate) {
      return;
    }

    const normalizedDate = dayjs(deepLinkDate).format('YYYY-MM-DD');
    setSelectedDate(normalizedDate);
    setCurrentDate(normalizedDate); // 달력도 해당 월/주로 이동

    setParams({ date: undefined });
  }, [deepLinkDate, setParams]);

  const [isWeekView, setIsWeekView] = useState(true);

  // 현재 달의 주 수(4~6). 하단 여백을 동적으로 상쇄하는 데 사용.
  const weeksInCurrentMonth = useMemo(() => {
    const startOfMonth = dayjs(currentDate).startOf('month');
    const firstDayOffset = (startOfMonth.day() - FIRST_DAY + 7) % 7;
    return Math.ceil((firstDayOffset + startOfMonth.daysInMonth()) / 7);
  }, [currentDate]);

  const monthViewBottomMargin = MONTH_VIEW_BASE_MARGIN - (6 - weeksInCurrentMonth) * WEEK_HEIGHT_PX;
  const selectedDateKoreanString = dayjs(selectedDate).format('YYYY년 MM월 DD일 dddd');

  const year = dayjs(selectedDate).year();
  const month = dayjs(selectedDate).month() + 1;
  const yearMonth = useMemo(() => ({ year, month }), [year, month]);

  const { data: taskList } = useFetchTaskList(yearMonth);
  const { data: myDowithInfo } = useFetchMyDowithInfo();

  // 날짜별로 태스크를 한 번만 그룹핑해두고, 달력 셀·선택 날짜·아이콘 판정에서 O(1)로 조회한다.
  // (기존에는 셀마다 전체 목록을 filter → O(보이는 날짜 × 태스크 수))
  const tasksByDate = useMemo(() => {
    const map = new Map<string, fetchTaskListResponseSchemeDataType>();
    if (!taskList) {
      return map;
    }

    const getOrCreate = (date: string) => {
      const existing = map.get(date);
      if (existing) {
        return existing;
      }

      const created: fetchTaskListResponseSchemeDataType = { dowithTasks: [], todoTasks: [] };
      map.set(date, created);
      return created;
    };

    taskList.dowithTasks.forEach(task => getOrCreate(task.date).dowithTasks.push(task));
    taskList.todoTasks.forEach(task => getOrCreate(task.date).todoTasks.push(task));

    return map;
  }, [taskList]);

  const selectedDateTaskList = taskList ? tasksByDate.get(selectedDate) ?? EMPTY_TASK_LIST : null;

  const handleBadge = () => {
    console.log('대표 뱃지 클릭');
  };

  const handlePressNotification = () => {
    navigate('FEEDBACK');
  };

  const handlePressPlusIcon = () => {
    navigate('TASK_FORM', { date: selectedDate, screen: 'COMMON' });
  };

  const handleDayPress = useCallback((dateString?: string) => {
    if (dateString) {
      setSelectedDate(dateString);
    }
  }, []);

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

  // 날짜별 마킹 상태를 taskList가 바뀔 때만 한 번 계산해둔다(셀 렌더마다 getTaskStatus 호출 방지).
  const statusByDate = useMemo(() => {
    const map = new Map<string, MarkingStatus>();
    tasksByDate.forEach((tasks, date) => map.set(date, getTaskStatus(tasks)));
    return map;
  }, [tasksByDate, getTaskStatus]);

  // 선택 여부는 selectedDate 비교 대신 라이브러리가 markedDates로 넘겨주는 marking.selected를 사용한다.
  // → renderDayComponent가 selectedDate에 의존하지 않아 참조가 안정적이고, 선택 시 바뀐 날짜 셀만 갱신된다.
  const renderDayComponent = useCallback(
    ({ date, state, marking }: DayProps & { date?: DateData }) => {
      const dateString = date?.dateString;
      return (
        <CalendarDay
          day={date?.day}
          dateString={dateString}
          isSelected={!!marking?.selected}
          isDisabled={state === 'disabled'}
          status={dateString ? statusByDate.get(dateString) ?? null : null}
          onPress={handleDayPress}
        />
      );
    },
    [statusByDate, handleDayPress],
  );

  const markedDates = useMemo(() => ({ [selectedDate]: { selected: true } }), [selectedDate]);

  const renderCustomHeader = useCallback(
    (date: Date) => (
      <CustomCalendarHeader
        type="EXPANDABLE"
        date={date}
        selectedDate={selectedDate}
        isWeekView={isWeekView}
        setIsWeekView={setIsWeekView}
        setCurrentDate={setCurrentDate}
        setSelectedDate={setSelectedDate}
      />
    ),
    [selectedDate, isWeekView],
  );

  return (
    <>
      <View style={{ height: top, backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_98 }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[theme.COLORS.GRAY_SCALE.GRAY_98, theme.COLORS.GRAY_SCALE.GRAY_96]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.profileWrap}
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
                <ProfileImage uri={myDowithInfo?.profileImageUrl} size={50} style={styles.badgeImage} />
              </Pressable>
              <View style={styles.titleWrap}>
                <Text style={styles.title}>{myDowithInfo?.nickname ?? ''}</Text>
                {myDowithInfo?.selfDescription && (
                  <Text style={[theme.TYPOGRAPHY.BODY_2, { color: theme.COLORS.GRAY_SCALE.GRAY_50 }]}>
                    {myDowithInfo.selfDescription}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </LinearGradient>
        {/* 스크롤 시 최상단에 고정되는 흰색 영역의 상단 캡(둥근 모서리). 아래 본문이 이 캡 밑으로 스크롤된다. */}
        <View style={styles.sheetCap} />
        <View style={styles.sheetBody}>
          <CalendarProvider
            style={styles.calendarWrap}
            date={currentDate}
            // 스와이프로 달을 이동할 때도 currentDate를 동기화(< > 버튼은 별도로 setCurrentDate). 동적 여백 계산에 필요.
            onMonthChange={month => setCurrentDate(month.dateString)}
          >
            <ExpandableCalendar
              // 주/월 전환 시에만 리마운트(위치 초기화).
              key={isWeekView ? 'weekView' : 'monthView'}
              initialPosition={isWeekView ? Positions.CLOSED : Positions.OPEN}
              markedDates={markedDates}
              firstDay={FIRST_DAY}
              dayComponent={renderDayComponent}
              renderHeader={renderCustomHeader}
              closeOnDayPress={false}
              allowShadow={false}
              hideArrows
              hideKnob
              disablePan
            />
            <View style={{ marginBottom: isWeekView ? WEEK_VIEW_BOTTOM_MARGIN : monthViewBottomMargin }} />
            <View style={{ marginHorizontal: 20 }}>
              <Divider style={styles.divider} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={theme.TYPOGRAPHY.CAPTION1_BASIC}>{selectedDateKoreanString}</Text>
                <TouchableOpacity style={{ paddingLeft: 8, paddingBottom: 8 }} onPress={handlePressPlusIcon}>
                  <PlusIcon />
                </TouchableOpacity>
              </View>
              {selectedDateTaskList ? (
                <View style={{ marginTop: 16 }}>
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
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_96,
  },
  profileWrap: {
    paddingHorizontal: 20,
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
  // 내용이 화면보다 짧아도 흰색 본문이 하단까지 차도록 최소 높이를 화면에 맞춘다.
  scrollContent: {
    flexGrow: 1,
  },
  sheetCap: {
    height: 20,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
    borderTopStartRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetBody: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 134,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
  },
  calendarWrap: {
    marginHorizontal: -20,
    // 주 뷰에서 커스텀 셀 높이가 라이브러리 기본 CLOSED_HEIGHT보다 커, 아래 월 뷰의 다음 주 행이 비치는 것을 잘라낸다.
    overflow: 'hidden',
  },
  calendarDay: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 날짜를 위로 정렬해 마킹 유무와 무관하게 위치가 일정. 마킹은 셀에 포함되어 어디서도 잘리지 않는다.
  dayWrap: {
    height: DAY_CELL_HEIGHT,
    alignItems: 'center',
    gap: 2,
  },
  selectedDay: {
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_40,
    borderRadius: 10,
  },
  selectedDayText: {
    color: theme.COLORS.DEFAULT.WHITE,
  },
  disabledDayText: {
    color: theme.COLORS.GRAY_SCALE.GRAY_80,
  },
  divider: {
    borderWidth: 0.5,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_92,
    marginTop: 12,
    marginBottom: 24,
  },
});
export { Home };
