import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import dayjs from 'dayjs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarProvider, ExpandableCalendar } from 'react-native-calendars';
import { Positions } from 'react-native-calendars/src/expandableCalendar';
import type { DateData } from 'react-native-calendars/src/types';
import type { DayProps } from 'react-native-calendars/src/calendar/day';

import { theme } from 'styles/theme';
import { ProfileImage } from 'components/common/ProfileImage';
import { ArrowRight } from 'components/common/icons/ArrowIcon';
import { PlusIcon } from 'components/common/icons/PlusIcon';
import { ListContainerView } from 'components/Task/ListContainerView';
import type { HomeTabScreenProps } from 'types/shared';
import { CustomCalendarHeader } from 'components/Task';
import { CalendarCheck } from 'components/common/icons/CalendarCheck';
import { DoubleCalendarCheck, CHECK_DARK } from 'components/common/icons/DoubleCalendarCheck';
import { useFetchTaskList } from 'hooks/queries/task/useFetchTaskList';
import { buildCalendarMarkedDates, getDateMarkingStatus, getSurroundingMonths, mergeTasksByDate } from 'utils/task';
import type { DateMarkingStatus, ModeMarkingStatus } from 'utils/task';
import { useFetchMyDowithInfo } from 'hooks/queries/member/useFetchMyDowithInfo';
import { useFetchReceivedFeedbacks } from 'hooks/queries/feedback/useFetchReceivedFeedbacks';
import { useScheduledRefetch } from 'hooks/shared/useScheduledRefetch';
import { useStore } from 'stores/index';
import { DowithCoachMark } from 'components/Onboarding/DowithCoachMark';
import type { Rect } from 'utils/onboarding';
import { TASK_QUERY_KEY } from 'constants/queries';
import type { fetchTaskListResponseSchemeDataType } from 'types/task/scheme/api';

// 요일 시작: 0=일, 1=월
const FIRST_DAY = 0;

// 날짜(24) + gap(2) + 마킹(21). 마킹 없어도 예약해 셀 높이를 균일하게.
const DAY_CELL_HEIGHT = 47;

// patch의 WEEK_HEIGHT와 동일. openHeight가 항상 6주 크기라, 주 수가 적은 달은 (6-주수)×이만큼 음수로 상쇄한다.
const WEEK_HEIGHT_PX = 61;
// 월뷰 하단 여백(6주 달 기준). 이 값만 조절하면 모든 달에 반영된다.
const MONTH_VIEW_BASE_MARGIN = 12;
const PROFILE_SIZE = 32;
const FAB_SIZE = 56;
const FAB_ICON_SIZE = 28;
const WEEK_VIEW_BOTTOM_MARGIN = 8;

const isSameRect = (a: Rect, b: Rect) => a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;

const isSameTargets = (a: { status: Rect; thunder: Rect }, b: { status: Rect; thunder: Rect }) =>
  isSameRect(a.status, b.status) && isSameRect(a.thunder, b.thunder);

// 태스크가 없는 날짜 조회 시 매번 새 객체를 만들지 않도록 공유하는 빈 목록
const EMPTY_TASK_LIST: fetchTaskListResponseSchemeDataType = { dowithTasks: [], todoTasks: [] };

/* 성공한 모드만 제 색을 쓰고, 나머지(실패·대기·부분 성공)는 회색으로 둔다. */
const getCheckColor = (status: ModeMarkingStatus, successColor: string) =>
  status === 'SUCCESS' ? successColor : theme.COLORS.GRAY_SCALE.GRAY_80;

/* 날짜 아래 마킹. 두윗·투두가 모두 있으면 겹친 체크, 한쪽만 있으면 단일 체크. */
const DateMarking = memo(({ dowith, todo }: DateMarkingStatus) => {
  if (dowith === 'NONE' && todo === 'NONE') {
    return null;
  }

  if (dowith !== 'NONE' && todo !== 'NONE') {
    return (
      <DoubleCalendarCheck
        leftFill={getCheckColor(todo, CHECK_DARK)}
        rightFill={getCheckColor(dowith, theme.COLORS.PRIMARY.RED_60)}
      />
    );
  }

  return dowith !== 'NONE' ? (
    <CalendarCheck fill={getCheckColor(dowith, theme.COLORS.PRIMARY.RED_60)} />
  ) : (
    <CalendarCheck fill={getCheckColor(todo, CHECK_DARK)} />
  );
});
DateMarking.displayName = 'DateMarking';

interface CalendarDayProps {
  day?: number;
  dateString?: string;
  isSelected: boolean;
  isDisabled: boolean;
  status: DateMarkingStatus | null;
  onPress: (dateString?: string) => void;
}

// 날짜 셀을 memo로 분리해, 다른 날짜 선택/달 이동 시 값이 바뀐 셀만 재렌더되게 한다(마킹 SVG 재렌더 최소화).
const CalendarDay = memo(({ day, dateString, isSelected, isDisabled, status, onPress }: CalendarDayProps) => (
  <TouchableOpacity style={styles.dayWrap} onPress={() => onPress(dateString)}>
    <View style={[styles.calendarDay, isSelected && styles.selectedDay]}>
      {/* 선택 스타일을 뒤에 둬야 달력 밖 날짜(disabled)를 선택했을 때 회색에 덮이지 않는다 */}
      <Text
        style={[theme.TYPOGRAPHY.CAPTION_2, isDisabled && styles.disabledDayText, isSelected && styles.selectedDayText]}
      >
        {day}
      </Text>
    </View>
    {status && <DateMarking {...status} />}
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

  /*
   * 조회 기준은 선택 날짜가 아니라 달력에 보이는 달(currentDate)이다.
   * 선택 날짜로 조회하면 달만 넘겼을 때 화면과 데이터의 달이 어긋나 마킹이 통째로 비었다.
   * 달력이 앞뒤 달 날짜까지 그리므로 3개월을 받아 합친다(목록 API에 기간 조회가 없다).
   * 쿼리 키가 월별이라 달을 넘겨도 새로 필요한 한 달만 요청된다.
   */
  const [prevMonth, currentMonth, nextMonth] = useMemo(() => getSurroundingMonths(currentDate), [currentDate]);

  const { data: prevMonthTaskList } = useFetchTaskList(prevMonth);
  const { data: currentMonthTaskList } = useFetchTaskList(currentMonth);
  const { data: nextMonthTaskList } = useFetchTaskList(nextMonth);
  const { data: myDowithInfo } = useFetchMyDowithInfo();
  const { data: receivedFeedbacks } = useFetchReceivedFeedbacks();

  /*
   * 첫 두윗 등록 후 한 번만 뜨는 코치마크.
   * 등록 성공이 예약해 준 경우에만 띄운다 — 플래그만 보면 기존 사용자에게도 뜬다.
   */
  const isDowithOnboardingPending = useStore(state => state.isDowithOnboardingPending);
  const { completeDowithOnboarding } = useStore(state => state.onboardingActions);
  const [onboardingTargets, setOnboardingTargets] = useState<{ status: Rect; thunder: Rect } | null>(null);

  /*
   * 좌표가 실제로 달라졌을 때만 상태를 바꾼다.
   * 매 렌더마다 재측정하므로, 같은 값으로도 갱신하면 리렌더가 끝없이 이어진다.
   */
  const handleMeasureOnboardingTargets = useCallback((next: { status: Rect; thunder: Rect }) => {
    setOnboardingTargets(prev => (prev && isSameTargets(prev, next) ? prev : next));
  }, []);

  /*
   * '내 잡도리'는 받은 잔소리 화면으로 가므로, 점은 안 읽은 잔소리를 뜻한다.
   * 무한 스크롤이라 불러온 페이지 안에서만 판단한다 — 안 읽은 잔소리는 최신이라 첫 페이지에 들어온다.
   */
  const hasUncheckedFeedback =
    receivedFeedbacks?.pages.some(page => page.data.feedbacks.some(feedback => !feedback.isChecked)) ?? false;

  /*
   * 태스크 변경 훅에 넘길 값. 낙관적 업데이트·무효화가 [...LIST, year, month] 캐시를 겨냥하므로
   * 보이는 달이 아니라 변경 대상이 속한 달(= 선택 날짜의 달)이어야 한다.
   */
  const year = dayjs(selectedDate).year();
  const month = dayjs(selectedDate).month() + 1;

  // 날짜별로 태스크를 한 번만 그룹핑해두고, 달력 셀·선택 날짜·아이콘 판정에서 O(1)로 조회한다.
  // (기존에는 셀마다 전체 목록을 filter → O(보이는 날짜 × 태스크 수))
  const tasksByDate = useMemo(
    () => mergeTasksByDate([prevMonthTaskList, currentMonthTaskList, nextMonthTaskList]),
    [prevMonthTaskList, currentMonthTaskList, nextMonthTaskList],
  );

  const hasAnyTaskList = !!(prevMonthTaskList || currentMonthTaskList || nextMonthTaskList);
  const selectedDateTaskList = hasAnyTaskList ? tasksByDate.get(selectedDate) ?? EMPTY_TASK_LIST : null;

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

  // 날짜별 마킹 상태를 taskList가 바뀔 때만 한 번 계산해둔다(셀 렌더마다 재계산 방지).
  const statusByDate = useMemo(() => {
    const map = new Map<string, DateMarkingStatus>();
    tasksByDate.forEach((tasks, date) => map.set(date, getDateMarkingStatus(tasks)));
    return map;
  }, [tasksByDate]);

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

  const markedDates = useMemo(
    () => buildCalendarMarkedDates({ selectedDate, visibleDate: currentDate }),
    [selectedDate, currentDate],
  );

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
      <View style={[styles.safeAreaTop, { height: top }]} />
      {/* 헤더는 스크롤과 무관하게 상단에 고정한다. */}
      <View style={styles.header}>
        <Pressable style={styles.headerProfile} onPress={handleBadge}>
          <ProfileImage uri={myDowithInfo?.profileImageUrl} size={PROFILE_SIZE} style={styles.badgeImage} />
          <Text style={styles.title}>{myDowithInfo?.nickname ?? ''}</Text>
        </Pressable>
        <Pressable style={styles.notificationWrap} onPress={handlePressNotification}>
          <Text style={[theme.TYPOGRAPHY.BODY_2, { color: theme.COLORS.GRAY_SCALE.GRAY_50 }]}>내 잡도리</Text>
          {/* 안 읽은 받은 잡도리가 있을 때만 표시 */}
          {hasUncheckedFeedback && <View style={styles.unreadDot} />}
          <ArrowRight fill={theme.COLORS.GRAY_SCALE.GRAY_80} />
        </Pressable>
      </View>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        /*
         * 코치마크가 예약된 동안에는 잠근다.
         * 좌표를 잰 뒤 Modal이 뜨기까지 몇 프레임이 비는데, 그 사이 스크롤하면
         * 하이라이트가 어긋난 자리에 뜬다. 스크롤은 리렌더를 일으키지 않아
         * 재측정으로도 잡히지 않는다. 어차피 곧 Modal이 화면을 덮으므로 앞당겨 막는다.
         */
        scrollEnabled={!isDowithOnboardingPending}
      >
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
              {selectedDateTaskList ? (
                <View style={{ marginTop: 16 }}>
                  <ListContainerView
                    year={year}
                    month={month}
                    taskList={selectedDateTaskList}
                    selectedDate={selectedDate}
                    onMeasureOnboardingTargets={isDowithOnboardingPending ? handleMeasureOnboardingTargets : undefined}
                  />
                </View>
              ) : null}
            </View>
          </CalendarProvider>
        </View>
      </ScrollView>
      {/* 탭 내비게이터가 탭바 위 영역만 화면으로 주므로 여기 bottom은 탭바와 겹치지 않는다. */}
      <Pressable style={styles.fab} onPress={handlePressPlusIcon}>
        <PlusIcon width={FAB_ICON_SIZE} height={FAB_ICON_SIZE} fill={theme.COLORS.DEFAULT.WHITE} />
      </Pressable>
      {isDowithOnboardingPending && onboardingTargets && (
        <DowithCoachMark
          statusTarget={onboardingTargets.status}
          thunderTarget={onboardingTargets.thunder}
          onClose={completeDowithOnboarding}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: theme.COLORS.PRIMARY.RED_60,
    alignItems: 'center',
    justifyContent: 'center',
    /* 잔소리 탭 FAB과 같은 값. iOS는 shadow*, Android는 elevation이 각각 필요하다. */
    shadowColor: theme.COLORS.DEFAULT.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  safeAreaTop: {
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
  },
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unreadDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.COLORS.PRIMARY.RED_60,
    alignSelf: 'flex-start',
    marginLeft: -2,
  },
  badgeImage: {
    width: PROFILE_SIZE,
    height: PROFILE_SIZE,
    borderRadius: PROFILE_SIZE / 2,
  },
  title: theme.TYPOGRAPHY.TITLE_3,
  // 내용이 화면보다 짧아도 흰색 본문이 하단까지 차도록 최소 높이를 화면에 맞춘다.
  scrollContent: {
    flexGrow: 1,
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
});
export { Home };
