import React, { Dispatch, SetStateAction } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import dayjs from 'dayjs';

import { ArrowLeft, ArrowRight } from 'components/common/icons/ArrowIcon';
import { Calendar } from 'components/common/icons/Calendar';
import { theme } from 'styles/theme';

interface Props {
  type: 'NORMAL' | 'EXPANDABLE';
  date: Date;
  setCurrentDate?: Dispatch<SetStateAction<string>>;
  selectedDate?: string;
  setSelectedDate?: Dispatch<SetStateAction<string>>;
  isWeekView?: boolean;
  setIsWeekView?: Dispatch<SetStateAction<boolean>>;
  // 제공 시 화살표가 setCurrentDate 대신 이 콜백으로 이동한다(명령형 스크롤 등, controlled current 에코 회피용).
  onMoveMonth?: (amount: number, baseDate: Date) => void;
}

// 화살표 터치 영역 확대
const ARROW_HIT_SLOP = { top: 12, bottom: 12, left: 8, right: 8 };

const CustomCalendarHeader = ({
  type,
  date,
  selectedDate,
  setCurrentDate,
  setSelectedDate,
  isWeekView,
  setIsWeekView,
  onMoveMonth,
}: Props) => {
  const isExpandableType = type === 'EXPANDABLE';
  const today = dayjs().format('YYYY-MM-DD');

  const moveDate = (_date: Date, amount: number, isWeekView?: boolean) => () => {
    if (onMoveMonth) {
      onMoveMonth(amount, _date);
      return;
    }

    setCurrentDate?.(prev =>
      dayjs(prev)
        .add(amount, isWeekView ? 'week' : 'month')
        .format('YYYY-MM-DD'),
    );
  };

  const toggleWeekView = () => {
    if (!setIsWeekView) {
      return;
    }

    setIsWeekView(!isWeekView);
  };

  const handleTodayButton = () => {
    if (setSelectedDate) {
      setSelectedDate(today);
    }
    setCurrentDate?.(today);
  };

  const monthArrows = (
    <View style={styles.weekCalendarArrowWrap}>
      <TouchableOpacity hitSlop={ARROW_HIT_SLOP} onPress={moveDate(date, -1, isWeekView)}>
        <ArrowLeft />
      </TouchableOpacity>
      <TouchableOpacity hitSlop={ARROW_HIT_SLOP} onPress={moveDate(date, 1, isWeekView)}>
        <ArrowRight />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.customHeaderContainer}>
      <View style={styles.customHeaderLeft}>
        {isExpandableType && <Calendar />}
        <Text style={theme.TYPOGRAPHY.SUB_TITLE}>{dayjs(date).format('YYYY년 M월')}</Text>
        {/* 홈은 화살표가 날짜 바로 옆에 붙는다. 루틴 시트(NORMAL)는 기존대로 오른쪽에 둔다. */}
        {isExpandableType && monthArrows}
        {isExpandableType && selectedDate !== today && (
          <TouchableOpacity style={styles.todayButton} onPress={handleTodayButton}>
            <Text style={theme.TYPOGRAPHY.CAPTION_2}>오늘</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.customHeaderRight}>
        {!isExpandableType && monthArrows}
        {isExpandableType && (
          <Pressable style={styles.weekToggleButton} onPress={toggleWeekView}>
            <Text style={theme.TYPOGRAPHY.CAPTION_2}>{isWeekView ? '주' : '월'}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  customHeaderContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  todayButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_92,
    borderRadius: 6,
    marginLeft: 8,
  },
  customHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  weekToggleButton: {
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_96,
    padding: 10,
    borderRadius: 8,
  },
  weekCalendarArrowWrap: {
    flexDirection: 'row',
    gap: 16,
  },
});

export { CustomCalendarHeader };
