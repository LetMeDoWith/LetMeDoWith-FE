import React, { memo, useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import type { DateData } from 'react-native-calendars/src/types';
import type { CalendarListImperativeMethods } from 'react-native-calendars/src/calendar-list';
import type { DayProps } from 'react-native-calendars/src/calendar/day';
import dayjs from 'dayjs';

import { CustomCalendarHeader } from 'components/Task';
import { theme } from 'styles/theme';

/*
 * 달력 치수·설정은 루틴 폼과 같은 값을 쓴다. 가로 페이징 CalendarList는 고정 높이가 필요해
 * 자체 높이는 최대(6주)로 두고, 실제 노출 높이는 보이는 달의 주 수만큼 wrapper가 잘라낸다.
 */
const CALENDAR_ROW_HEIGHT = 50;
const CALENDAR_HEADER_HEIGHT = 48;
const CALENDAR_LIST_MAX_HEIGHT = CALENDAR_HEADER_HEIGHT + CALENDAR_ROW_HEIGHT * 6;
const CALENDAR_LIST_STYLE = { paddingLeft: 0, paddingRight: 0 };
const CALENDAR_HEADER_STYLE = { paddingHorizontal: 15 };
const MemoizedCalendarList = memo(CalendarList);

const getWeeksInMonth = (dateString: string) => {
  const startOfMonth = dayjs(dateString).startOf('month');
  return Math.ceil((startOfMonth.day() + startOfMonth.daysInMonth()) / 7);
};

const getDayTextColor = (dateString: string, state?: string) => {
  if (state === 'disabled') {
    return theme.COLORS.GRAY_SCALE.GRAY_80;
  }

  const dayOfWeek = new Date(dateString).getDay();

  if (dayOfWeek === 0) {
    return theme.COLORS.PRIMARY.RED_60;
  }

  if (dayOfWeek === 6) {
    return theme.COLORS.SECONDARY.BLUE_60;
  }

  return theme.COLORS.DEFAULT.BLACK;
};

interface Props {
  /* 아직 확정하지 않은 선택값(YYYY-MM-DD). 확인을 눌러야 폼에 반영된다. */
  selectedDate: string;
  onSelect: (dateString: string) => void;
  /* 도리는 지난 날짜에 등록할 수 없어 오늘 이전을 막는다 */
  minDate?: string;
}

const DateStep = ({ selectedDate, onSelect, minDate }: Props) => {
  // current는 마운트 후 바꾸지 않는다. 스와이프에 맞춰 바꾸면 라이브러리가 되걸어 월이 왕복한다.
  const [currentDate] = useState(selectedDate);
  const [calendarWidth, setCalendarWidth] = useState(0);
  const [visibleMonth, setVisibleMonth] = useState(selectedDate);
  const calendarRef = React.useRef<CalendarListImperativeMethods>(null);

  const calendarWrapperHeight = useMemo(
    () => CALENDAR_HEADER_HEIGHT + getWeeksInMonth(visibleMonth) * CALENDAR_ROW_HEIGHT,
    [visibleMonth],
  );

  const handleVisibleMonthChange = useCallback((month: DateData) => {
    setVisibleMonth(month.dateString);
  }, []);

  const handleMoveMonth = useCallback((amount: number, baseDate: Date) => {
    calendarRef.current?.scrollToMonth(dayjs(baseDate).add(amount, 'month').format('YYYY-MM-DD'));
  }, []);

  const renderCustomHeader = useCallback(
    (date: Date) => <CustomCalendarHeader type="NORMAL" date={date} onMoveMonth={handleMoveMonth} />,
    [handleMoveMonth],
  );

  const handleDayPress = useCallback(
    (day: DateData) => {
      onSelect(day.dateString);
    },
    [onSelect],
  );

  const renderDayComponent = useCallback(
    ({ date, state }: DayProps & { date?: DateData }) => {
      if (!date) {
        return null;
      }

      const isDisabled = state === 'disabled';
      const isSelected = date.dateString === selectedDate;

      return (
        <View style={styles.dayCell}>
          <Pressable
            style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
            disabled={isDisabled}
            onPress={() => handleDayPress(date)}
          >
            <Text style={[styles.dayText, { color: getDayTextColor(date.dateString, state) }]}>{date.day}</Text>
          </Pressable>
        </View>
      );
    },
    [selectedDate, handleDayPress],
  );

  return (
    <View
      style={styles.container}
      onLayout={event => {
        const { width } = event.nativeEvent.layout;
        if (width > 0 && width !== calendarWidth) {
          setCalendarWidth(width);
        }
      }}
    >
      {calendarWidth > 0 && (
        <View style={[styles.calendarClip, { height: calendarWrapperHeight }]}>
          <MemoizedCalendarList
            ref={calendarRef}
            current={currentDate}
            horizontal
            pagingEnabled
            staticHeader
            calendarWidth={calendarWidth}
            calendarHeight={CALENDAR_LIST_MAX_HEIGHT}
            calendarStyle={CALENDAR_LIST_STYLE}
            headerStyle={CALENDAR_HEADER_STYLE}
            pastScrollRange={12}
            futureScrollRange={24}
            minDate={minDate}
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
  );
};

const styles = StyleSheet.create({
  /* 시트 좌우 패딩(24)을 살짝 상쇄해 달력을 조금 더 넓게 편다 */
  container: {
    marginHorizontal: -8,
    paddingTop: 8,
  },
  /* 보이는 달의 주 수만큼만 노출해 아래 여백을 없앤다 */
  calendarClip: {
    overflow: 'hidden',
  },
  dayCell: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  dayButton: {
    height: 36,
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  dayButtonSelected: {
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_92,
  },
  dayText: theme.TYPOGRAPHY.BODY_2,
});

export { DateStep };
