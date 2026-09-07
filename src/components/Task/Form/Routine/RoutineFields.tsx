import React, { memo, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Divider, Switch } from 'react-native-paper';
import { CalendarList } from 'react-native-calendars';
import type { DateData } from 'react-native-calendars/src/types';
import type { DayProps } from 'react-native-calendars/src/calendar/day';
import dayjs from 'dayjs';

import { CustomCalendarHeader } from 'components/Task';
import { DropArrow } from 'components/common/icons/DropArrow';
import {
  CALENDAR_HEADER_STYLE,
  CALENDAR_LIST_MAX_HEIGHT,
  CALENDAR_LIST_STYLE,
  getDayTextColor,
  WEEKLY_DAY_INFO,
} from 'components/Task/Form/Routine/constants';
import type { useRoutineForm } from 'components/Task/Form/Routine/useRoutineForm';
import { TASK_ROUTINE_CYCLE_ENUM } from 'schemes/task/enum';
import { theme } from 'styles/theme';

const MemoizedCalendarList = memo(CalendarList);

const REPEAT_CYCLES = [
  { value: TASK_ROUTINE_CYCLE_ENUM.enum.DAILY, name: '매일' },
  { value: TASK_ROUTINE_CYCLE_ENUM.enum.WEEKLY, name: '매 주' },
  { value: TASK_ROUTINE_CYCLE_ENUM.enum.MONTHLY, name: '매 월' },
] as const;

const MONTHLY_DAY_COUNT = 32;
const LAST_DAY_OF_MONTH = 32;

interface Props {
  routine: ReturnType<typeof useRoutineForm>;
  /* 화면과 시트의 좌우 여백·하단 여백이 달라 밖에서 넘긴다 */
  contentContainerStyle?: StyleProp<ViewStyle>;
}

const RoutineFields = ({ routine, contentContainerStyle }: Props) => {
  const {
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
    toggleWeeklyDay,
    selectedMonthlyDaySet,
    toggleMonthlyDay,
    expanded,
    toggleExpanded,
    isExcludeHolidays,
    handleExcludeHolidays,
  } = routine;

  const renderCustomHeader = useCallback(
    (date: Date) => <CustomCalendarHeader type="NORMAL" date={date} onMoveMonth={handleMoveMonth} />,
    [handleMoveMonth],
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
        // 셀이 열 전체 폭을 채우게 해 캘린더 폭과 무관하게 기간 배경이 인접 셀과 항상 맞닿게 한다.
        <View style={styles.dayCell}>
          {!isSingleDay && (
            <View style={styles.dayBackgroundLayer}>
              <View style={[styles.dayBackgroundHalf, { backgroundColor: getBackgroundDayColor(isEndDay) }]} />
              <View style={[styles.dayBackgroundHalf, { backgroundColor: getBackgroundDayColor(isStartDay) }]} />
            </View>
          )}
          <Pressable
            onPress={() => handleDayPress(date)}
            disabled={isDisabled}
            style={[styles.dayButton, (isStartDay || isEndDay) && styles.dayButtonSelected]}
          >
            <Text style={[theme.TYPOGRAPHY.BODY_2, { color: textColor }]}>{date.day}</Text>
          </Pressable>
        </View>
      );
    },
    [handleDayPress],
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.dateSection}>
        <View style={styles.dateLeftSection}>
          <View style={styles.dateRow}>
            <Text style={theme.TYPOGRAPHY.SUB_TITLE}>시작 날짜</Text>
            <Text style={theme.TYPOGRAPHY.BODY_2}>
              {dayjs(routineCondition?.startDate || targetDateString).format('YYYY. MM. DD (ddd)')}
            </Text>
          </View>
          <View style={styles.dateRow}>
            <Text style={theme.TYPOGRAPHY.SUB_TITLE}>종료 날짜</Text>
            <Text style={[theme.TYPOGRAPHY.BODY_2, !selectedEndDate && styles.emptyDateText]}>
              {selectedEndDate ? dayjs(selectedEndDate).format('YYYY. MM. DD (ddd)') : '날짜를 선택해주세요'}
            </Text>
          </View>
        </View>
        <Pressable style={styles.dateRightSection} onPress={toggleExpanded}>
          <DropArrow direction={expanded ? 'UP' : 'DOWN'} />
        </Pressable>
      </View>
      <Divider style={styles.divider} />
      {expanded && (
        <View
          // 바깥 컨테이너 좌우 패딩(화면 20 / 시트 24)을 살짝 상쇄해 달력을 조금 더 넓게 편다(과하면 잘림).
          style={styles.calendarWrap}
          onLayout={event => {
            const { width } = event.nativeEvent.layout;
            if (width > 0 && width !== calendarWidth) {
              setCalendarWidth(width);
            }
          }}
        >
          {calendarWidth > 0 && (
            // 보이는 달 높이만큼만 노출(overflow 클립)해 여백 제거.
            <View style={[styles.calendarClip, { height: calendarWrapperHeight }]}>
              <MemoizedCalendarList
                ref={calendarRef}
                current={currentDate}
                // 가로 페이징으로 좌우 스와이프 시 월이 슬라이드 애니메이션과 함께 이동한다.
                horizontal
                pagingEnabled
                // 헤더(화살표 포함)는 고정하고 달력 본문만 슬라이드시킨다.
                staticHeader
                calendarWidth={calendarWidth}
                // 자체 높이는 최대(6주)로 고정 → 달 전환 시 재렌더/재측정 최소화(실제 노출은 wrapper가 클립).
                calendarHeight={CALENDAR_LIST_MAX_HEIGHT}
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
          {REPEAT_CYCLES.map(({ value, name }) => (
            <Pressable
              key={value}
              style={[
                styles.routinePrimaryCategoryButton,
                selectedPrimaryCategory === value && styles.routinePrimaryCategoryButtonSelected,
              ]}
              onPress={handlePrimaryCategory(value)}
            >
              <Text style={styles.routinePrimaryCategoryButtonText}>{name}</Text>
            </Pressable>
          ))}
        </View>
        {selectedPrimaryCategory === TASK_ROUTINE_CYCLE_ENUM.enum.WEEKLY && (
          <View style={styles.weeklyRow}>
            {WEEKLY_DAY_INFO.map(({ code, value, name }) => {
              const isSelected = selectedWeeklyDaySet.has(value);

              return (
                <Pressable
                  key={code}
                  style={[styles.weeklyDay, isSelected && styles.patternDaySelected]}
                  onPress={() => toggleWeeklyDay(value)}
                >
                  <Text style={[styles.patternDayText, isSelected && styles.patternDayTextSelected]}>{name}</Text>
                </Pressable>
              );
            })}
          </View>
        )}
        {selectedPrimaryCategory === TASK_ROUTINE_CYCLE_ENUM.enum.MONTHLY && (
          <View style={styles.monthlyGrid}>
            {Array.from({ length: MONTHLY_DAY_COUNT }, (_, index) => {
              const day = index + 1;
              const isLastDay = day === LAST_DAY_OF_MONTH;
              const isSelected = selectedMonthlyDaySet.has(day);

              return (
                <Pressable
                  key={day}
                  style={[
                    isLastDay ? styles.monthlyLastDay : styles.monthlyDay,
                    isSelected && styles.patternDaySelected,
                  ]}
                  onPress={() => toggleMonthlyDay(day)}
                >
                  <Text style={[styles.patternDayText, isSelected && styles.patternDayTextSelected]}>
                    {isLastDay ? '마지막 날' : day}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
      <View style={styles.selectHolidaySection}>
        <View style={styles.selectHolidayTitleWrap}>
          <Text style={theme.TYPOGRAPHY.SUB_TITLE}>공휴일 제외하기</Text>
          <Text style={styles.optionalLabel}>(선택)</Text>
        </View>
        <Switch value={isExcludeHolidays} color={theme.COLORS.PRIMARY.RED_60} onValueChange={handleExcludeHolidays} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  /* 하단 여백은 두지 않는다. 아래에 붙는 요소(초기화 버튼 등)가 간격을 갖게 해 이중으로 벌어지지 않게 한다. */
  container: {
    flex: 1,
    paddingTop: 24,
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
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyDateText: {
    color: theme.COLORS.GRAY_SCALE.GRAY_60,
  },
  dateRightSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
  },
  divider: {
    marginVertical: 20,
  },
  calendarWrap: {
    marginBottom: 32,
    marginHorizontal: -8,
  },
  calendarClip: {
    overflow: 'hidden',
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
  routinePrimaryCategoryButtonSelected: {
    borderColor: theme.COLORS.DEFAULT.BLACK,
  },
  routinePrimaryCategoryButtonText: theme.TYPOGRAPHY.SUB_TITLE,
  weeklyRow: {
    flexDirection: 'row',
    gap: 6,
  },
  weeklyDay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 38,
    borderRadius: 8,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_96,
  },
  monthlyGrid: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  monthlyDay: {
    // TODO: % 단위 말고 다른 방법으로 구현 필요
    width: '12.2857%',
    justifyContent: 'center',
    alignItems: 'center',
    height: 38,
    borderRadius: 8,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_96,
  },
  monthlyLastDay: {
    width: '54.1429%',
    justifyContent: 'center',
    alignItems: 'center',
    height: 38,
    borderRadius: 8,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_96,
  },
  patternDaySelected: {
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_30,
  },
  patternDayText: {
    ...theme.TYPOGRAPHY.BODY_2,
    color: theme.COLORS.DEFAULT.BLACK,
  },
  patternDayTextSelected: {
    color: theme.COLORS.DEFAULT.WHITE,
  },
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
  optionalLabel: {
    ...theme.TYPOGRAPHY.CAPTION1_BASIC,
    color: theme.COLORS.GRAY_SCALE.GRAY_70,
  },
  // 라이브러리 dayContainer(flex:1, column)의 가로 폭을 채운다(alignSelf:stretch). flex:1은 세로로 늘어나 붕괴하므로 금지.
  dayCell: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  dayBackgroundLayer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -5,
    right: -5,
    flexDirection: 'row',
    overflow: 'visible',
  },
  dayBackgroundHalf: {
    flex: 1,
  },
  dayButton: {
    height: 36,
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  dayButtonSelected: {
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_92,
    borderRadius: 18,
  },
});

export { RoutineFields };
