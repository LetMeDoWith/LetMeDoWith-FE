import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/src/types';
import { Divider } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import type { MarkedDates } from 'react-native-calendars/src/types';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import { theme } from 'styles/theme';
import { BottomSheet } from 'components/common/BottomSheet';
import { DropArrow } from 'components/common/icons/DropArrow';

dayjs.extend(isSameOrBefore);

const RoutineBottomSheet = forwardRef<BottomSheetModalMethods, unknown>((props, ref) => {
  const innerRef = useRef<BottomSheetModalMethods>(null);
  const todayDateString = dayjs().format('YYYY-MM-DD');
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);
  const [selectedPrimaryCategory, setSelectedPrimaryCategory] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | null>(null);
  const [expanded, setExpanded] = useState(true);

  const isValidDatePeriod = selectedStartDate && selectedEndDate;

  const getMarkedDates = (start: string | null, end: string | null): MarkedDates => {
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

  const handleDismiss = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
  };

  const handleSubmit = () => {};

  const handleExpanded = () => {
    if (expanded) {
      setSelectedStartDate(null);
      setSelectedEndDate(null);
    }
    setExpanded(!expanded);
  };

  const handlePrimaryCategory = (value: 'DAILY' | 'WEEKLY' | 'MONTHLY') => () => {
    setSelectedPrimaryCategory(value);
  };

  useImperativeHandle(ref, () => innerRef.current!);

  return (
    <BottomSheet
      ref={innerRef}
      title="루틴 등록하기"
      buttonConfig={{ title: '등록하기', isDisabled: false }}
      snapPoints={['90%']}
      onDismiss={handleDismiss}
      handleButtonSubmit={handleSubmit}
    >
      <View style={styles.container}>
        <View style={styles.dateSection}>
          <View style={styles.dateLeftSection}>
            <Text style={theme.TYPOGRAPHY.SUB_TITLE}>반복 기간</Text>
            {!isValidDatePeriod && (
              <Text style={[theme.TYPOGRAPHY.CAPTION1_BASIC, { color: theme.COLORS.GRAY_SCALE.GRAY_60 }]}>
                루틴을 반복할 시작일과 종료일을 선택해주세요.
              </Text>
            )}
          </View>
          <Pressable style={styles.dateRightSection} onPress={handleExpanded}>
            <Text
              style={[
                theme.TYPOGRAPHY.BODY_2,
                {
                  color: isValidDatePeriod ? theme.COLORS.DEFAULT.BLACK : theme.COLORS.GRAY_SCALE.GRAY_70,
                },
              ]}
            >
              {isValidDatePeriod ? `${selectedStartDate} ~ ${selectedEndDate}` : '미선택'}
            </Text>
            <DropArrow direction={expanded ? 'UP' : 'DOWN'} />
          </Pressable>
          <View />
        </View>
        <Divider style={{ marginVertical: 20 }} />
        {expanded && (
          <Calendar
            markingType="period"
            markedDates={getMarkedDates(selectedStartDate, selectedEndDate)}
            minDate={todayDateString}
            onDayPress={date => {
              if (!selectedStartDate) {
                setSelectedStartDate(date.dateString);
                return;
              }
              setSelectedEndDate(date.dateString);
            }}
          />
        )}
        <View style={styles.routineSection}>
          <Text style={styles.routineSectionTitle}>반복 패턴</Text>
          <View style={styles.routinePrimaryCategoryButtonSection}>
            <Pressable
              style={[
                styles.routinePrimaryCategoryButton,
                selectedPrimaryCategory === 'DAILY' && { borderColor: theme.COLORS.DEFAULT.BLACK },
              ]}
              onPress={handlePrimaryCategory('DAILY')}
            >
              <Text style={styles.routinePrimaryCategoryButtonText}>매일</Text>
            </Pressable>
            <Pressable
              style={[
                styles.routinePrimaryCategoryButton,
                selectedPrimaryCategory === 'WEEKLY' && { borderColor: theme.COLORS.DEFAULT.BLACK },
              ]}
              onPress={handlePrimaryCategory('WEEKLY')}
            >
              <Text style={styles.routinePrimaryCategoryButtonText}>매 주</Text>
            </Pressable>
            <Pressable
              style={[
                styles.routinePrimaryCategoryButton,
                selectedPrimaryCategory === 'MONTHLY' && { borderColor: theme.COLORS.DEFAULT.BLACK },
              ]}
              onPress={handlePrimaryCategory('MONTHLY')}
            >
              <Text style={styles.routinePrimaryCategoryButtonText}>매 월</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  dateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateLeftSection: {
    gap: 8,
  },
  dateRightSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
  },
  routineSection: {
    marginTop: 32,
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
});

export { RoutineBottomSheet };
