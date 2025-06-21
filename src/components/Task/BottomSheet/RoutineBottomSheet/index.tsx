import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/src/types';
import { Divider, Switch } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import type { MarkedDates } from 'react-native-calendars/src/types';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import { theme } from 'styles/theme';
import { BottomSheet } from 'components/common/BottomSheet';
import { DropArrow } from 'components/common/icons/DropArrow';
import type { TaskModeType } from 'types/shared';

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

interface Props {
  taskMode: TaskModeType | null;
}

const RoutineBottomSheet = forwardRef<BottomSheetModalMethods, Props>(({ taskMode }, ref) => {
  const innerRef = useRef<BottomSheetModalMethods>(null);
  const todayDateString = dayjs().format('YYYY-MM-DD');
  // 투두 모드에서 사용하는 선택 기간 상태
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);
  // 두윗 모드에서 사용하는 선택한 일자들 상태
  const [selectedDateSet, setSelectedDateSet] = useState<Set<string>>(new Set());
  const [selectedPrimaryCategory, setSelectedPrimaryCategory] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | null>(null);
  const [selectedWeeklyDaySet, setSelectedWeeklyDaySet] = useState<
    Set<'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY'>
  >(new Set());
  const [selectedMonthlyDaySet, setSelectedMonthlyDaySet] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState(true);
  const [isExcludeHolidays, setIsExcludeHolidays] = useState(false);

  const isTodoMode = taskMode === 'TODO';
  const isValidDatePeriod = selectedStartDate && selectedEndDate;
  const isValidDateSet = selectedDateSet.size > 0;

  // 두윗 모드에서 사용되는 선택한 일자들 중 제일 빠른 일자와 먼 일자 반환
  const getMinMaxDate = (dateSet: Set<string>) => {
    if (dateSet.size === 0) {
      return [null, null];
    }
    const arr = Array.from(dateSet);
    arr.sort(); // 문자열(YYYY-MM-DD)이면 이렇게 정렬하면 날짜순 정렬
    return [arr[0], arr[arr.length - 1]];
  };

  // 두윗 모드에서 사용되는 선택한 일자들 마킹
  const getMarkedDates = (selectedDates: Set<string>) => {
    const marked: MarkedDates = {};
    selectedDates.forEach(dateStr => {
      marked[dateStr] = {
        customStyles: {
          container: {
            backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_92,
          },
          text: {
            color: theme.COLORS.DEFAULT.BLACK,
          },
        },
      };
    });
    return marked;
  };

  // 투두 모드에서 사용되는 선택한 기간 마킹
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

  const handleExcludeHolidays = () => setIsExcludeHolidays(!isExcludeHolidays);

  const handleDismiss = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setSelectedDateSet(new Set());
    setIsExcludeHolidays(false);
    setSelectedPrimaryCategory(null);
    setSelectedWeeklyDaySet(new Set());
    setSelectedMonthlyDaySet(new Set());
    setExpanded(true);
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
    // 선택한 반복 패턴이 매 주가 아닐 경우 선택한 요일 Set 초기화
    if (value !== 'WEEKLY') {
      setSelectedWeeklyDaySet(new Set());
    }

    // 선택한 반복 패턴이 매 월이 아닐 경우 선택한 일수 Set 초기화
    if (value !== 'MONTHLY') {
      setSelectedMonthlyDaySet(new Set());
    }

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
            <Text style={theme.TYPOGRAPHY.SUB_TITLE}>{isTodoMode ? '반복 기간' : '선택 날짜'}</Text>
            {isTodoMode && !isValidDatePeriod && (
              <Text style={[theme.TYPOGRAPHY.CAPTION1_BASIC, { color: theme.COLORS.GRAY_SCALE.GRAY_60 }]}>
                루틴을 반복할 시작일과 종료일을 선택해주세요.
              </Text>
            )}
          </View>
          {isTodoMode ? (
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
          ) : (
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              {isValidDateSet && <Text style={theme.TYPOGRAPHY.BODY_2}>{selectedDateSet.size}개</Text>}
              <Text
                style={[
                  theme.TYPOGRAPHY.BODY_2,
                  {
                    color: theme.COLORS.GRAY_SCALE.GRAY_60,
                  },
                ]}
              >
                {isValidDateSet
                  ? selectedDateSet.size > 1
                    ? `${getMinMaxDate(selectedDateSet)[0]} ~ ${getMinMaxDate(selectedDateSet)[1]}`
                    : selectedDateSet
                  : '미선택'}
              </Text>
            </View>
          )}
        </View>
        <Divider style={{ marginVertical: 20 }} />
        {expanded && (
          <Calendar
            style={{ marginBottom: 32 }}
            markingType={isTodoMode ? 'period' : 'custom'}
            markedDates={
              isTodoMode ? getMarkedPeriodDates(selectedStartDate, selectedEndDate) : getMarkedDates(selectedDateSet)
            }
            minDate={todayDateString}
            onDayPress={date => {
              if (isTodoMode) {
                if (!selectedStartDate) {
                  setSelectedStartDate(date.dateString);
                  return;
                }
                setSelectedEndDate(date.dateString);
              }

              setSelectedDateSet(prev => {
                const newSet = new Set(prev);
                if (newSet.has(date.dateString)) {
                  newSet.delete(date.dateString);
                } else {
                  newSet.add(date.dateString);
                }
                return newSet;
              });
            }}
          />
        )}
        {isTodoMode && (
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
            {selectedPrimaryCategory === 'WEEKLY' && (
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {WEEKLY_DAY_INFO.map(({ code, name }) => (
                  <Pressable
                    key={code}
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: 38,
                      borderRadius: 8,
                      backgroundColor: selectedWeeklyDaySet.has(code)
                        ? theme.COLORS.GRAY_SCALE.GRAY_30
                        : theme.COLORS.GRAY_SCALE.GRAY_96,
                    }}
                    onPress={() => {
                      setSelectedWeeklyDaySet(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(code)) {
                          newSet.delete(code);
                        } else {
                          newSet.add(code);
                        }
                        return newSet;
                      });
                    }}
                  >
                    <Text
                      style={{
                        color: selectedWeeklyDaySet.has(code) ? theme.COLORS.DEFAULT.WHITE : theme.COLORS.DEFAULT.BLACK,
                      }}
                    >
                      {name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
            {selectedPrimaryCategory === 'MONTHLY' && (
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
        )}
        {isTodoMode && (
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
        )}
      </View>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
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
});

export { RoutineBottomSheet };
