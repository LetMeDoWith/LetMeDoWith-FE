import React, { Dispatch, SetStateAction } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import dayjs from 'dayjs';

import { ArrowLeft, ArrowRight } from 'components/common/icons/ArrowIcon';
import { Calendar } from 'components/common/icons/Calendar';
import { theme } from 'styles/theme';

interface Props {
  type: 'NORMAL' | 'EXPANDABLE';
  date: Date;
  isWeekView?: boolean;
  setIsWeekView?: Dispatch<SetStateAction<boolean>>;
  setCurrentDate: Dispatch<SetStateAction<string>>;
}

const CustomCalendarHeader = ({ type, date, isWeekView, setIsWeekView, setCurrentDate }: Props) => {
  const isExpandableType = type === 'EXPANDABLE';

  const moveDate = (date: Date, amount: number, isWeekView?: boolean) => () => {
    setCurrentDate(prev =>
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

  return (
    <View style={styles.customHeaderContainer}>
      <View style={styles.customHeaderLeft}>
        {isExpandableType && <Calendar />}
        <Text style={theme.TYPOGRAPHY.CAPTION1_BASIC}>{dayjs(date).format('YYYY년 MM월')}</Text>
      </View>
      <View style={styles.customHeaderRight}>
        <View style={styles.weekCalendarArrowWrap}>
          <TouchableOpacity onPress={moveDate(date, -1, isWeekView)}>
            <ArrowLeft />
          </TouchableOpacity>
          <TouchableOpacity onPress={moveDate(date, 1, isWeekView)}>
            <ArrowRight />
          </TouchableOpacity>
        </View>
        {isExpandableType && (
          <Pressable
            style={{
              backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_96,
              padding: 10,
              borderRadius: 8,
            }}
            onPress={toggleWeekView}
          >
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
  customHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  customHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  weekCalendarArrowWrap: {
    flexDirection: 'row',
    gap: 12,
  },
});

export { CustomCalendarHeader };
