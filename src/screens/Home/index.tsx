import React, { useState } from 'react';
import { Image, Pressable, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import dayjs from 'dayjs';
import { Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarProvider, ExpandableCalendar } from 'react-native-calendars';
import { LocaleConfig } from 'react-native-calendars/src';
import { Positions } from 'react-native-calendars/src/expandableCalendar';
import type { DateData, Direction } from 'react-native-calendars/src/types';
import type { DayProps } from 'react-native-calendars/src/calendar/day';

import { theme } from 'styles/theme';
import { TrafficGreenLight } from 'components/common/icons/TrafficGreenLight';
import { Notification } from 'components/common/icons/Notification';
import { isAos } from 'utils/device';
import { ArrowLeft } from 'components/common/icons/ArrowIcon';
import { ArrowRight } from 'components/common/icons/ArrowIcon';
import { PlusIcon } from 'components/common/icons/PlusIcon';
import type { HomeTabScreenProps } from 'types/shared';

LocaleConfig.locales['kr'] = {
  monthNames: ['01월', '02월', '03월', '04월', '05월', '06월', '07월', '08월', '09월', '10월', '11월', '12월'],
  monthNamesShort: ['01월', '02월', '03월', '04월', '05월', '06월', '07월', '08월', '09월', '10월', '11월', '12월'],
  dayNames: ['화요일', '수요일', '목요일', '금요일', '토요일', '일요일', '월요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};

LocaleConfig.defaultLocale = 'kr';

const Home = ({ navigation: { navigate } }: HomeTabScreenProps<'MYTODO'>) => {
  const { top } = useSafeAreaInsets();
  const todayDateString = dayjs().format('YYYY-MM-DD');

  const [selectedDate, setSelectedDate] = useState(todayDateString);
  const [weekView, setWeekView] = useState(true);

  const selectedDateKoreanString = dayjs(selectedDate).format('YYYY년 MM월 DD일');

  const handleBadge = () => {
    console.log('대표 뱃지 클릭');
  };

  const handlePressNotificationIcon = () => {
    console.log('알림 버튼 클릭');
  };

  const handlePressPlusIcon = () => {
    navigate('TASK_FORM');
  };

  const handleDayPress = (date?: DateData) => () => {
    if (!date) return;

    setSelectedDate(date.dateString);
  };

  const toggleWeekView = () => {
    setWeekView(!weekView);
  };

  const renderDayComponent = ({
    date,
    state,
    marking,
  }: DayProps & {
    date?: DateData;
  }) => {
    const isToday = date?.dateString === todayDateString;

    return (
      <TouchableOpacity
        style={[{ padding: 6 }, date?.dateString === selectedDate && styles.selectedDay]}
        disabled={state === 'disabled'}
        onPress={handleDayPress(date)}
      >
        <View>
          <Text
            style={[
              { fontSize: 12 },
              date?.dateString === selectedDate && styles.selectedDayText,
              // date?.dateString === selectedDate && marking?.selectedStyle,
            ]}
          >
            {date?.day}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // const renderCustomHeader = ({ onPressArrowLeft, onPressArrowRight }) => {
  //   console.log('onPressArrowLeft: ', onPressArrowLeft);
  //   return (
  //     <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
  //       <Pressable
  //         style={{
  //           backgroundColor: weekView ? theme.COLORS.GRAY_SCALE.GRAY_400 : theme.COLORS.DEFAULT.WHITE,
  //           padding: 10,
  //           borderRadius: 20,
  //         }}
  //         onPress={toggleWeekView}
  //       >
  //         <Text>주</Text>
  //       </Pressable>
  //       <View style={styles.weekCalendarArrowWrap}>
  //         <TouchableOpacity onPress={onPressArrowLeft}>
  //           <ArrowLeft />
  //         </TouchableOpacity>
  //         <TouchableOpacity onPress={onPressArrowRight}>
  //           <ArrowRight />
  //         </TouchableOpacity>
  //       </View>
  //     </View>
  //   );
  // };

  const renderArrow = (direction: Direction) => {
    if (direction === 'left') {
      return <ArrowLeft />;
    } else {
      return <ArrowRight />;
    }
  };

  useFocusEffect(() => {
    if (!isAos) return;

    StatusBar.setBackgroundColor(theme.COLORS.STATUS.GREEN_90);
    StatusBar.setBarStyle('dark-content');

    return () => {
      StatusBar.setBackgroundColor('white');
      StatusBar.setBarStyle('dark-content');
    };
  });

  return (
    <>
      {!isAos && <View style={{ backgroundColor: theme.COLORS.STATUS.GREEN_90, height: top }} />}
      <View style={styles.container}>
        <View style={styles.profile}>
          <View style={styles.iconWrap}>
            <TrafficGreenLight />
            <Pressable onPress={handlePressNotificationIcon}>
              <Notification />
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
              <Text style={styles.description}>안녕하세요 갓생감자입니다</Text>
            </View>
          </View>
        </View>
        <View style={{ flex: 1, gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Pressable
              style={{
                backgroundColor: weekView ? theme.COLORS.GRAY_SCALE.GRAY_400 : theme.COLORS.DEFAULT.WHITE,
                padding: 10,
                borderRadius: 10,
              }}
              onPress={toggleWeekView}
            >
              <Text>주</Text>
            </Pressable>
            {/*<View style={styles.weekCalendarArrowWrap}>*/}
            {/*  <TouchableOpacity>*/}
            {/*    <ArrowLeft />*/}
            {/*  </TouchableOpacity>*/}
            {/*  <TouchableOpacity>*/}
            {/*    <ArrowRight />*/}
            {/*  </TouchableOpacity>*/}
            {/*</View>*/}
          </View>
          <View style={{ flex: 1 }}>
            <CalendarProvider style={styles.calendarWrap} date={todayDateString}>
              <ExpandableCalendar
                key={weekView ? 'weekView' : 'monthView'}
                style={!weekView && { marginBottom: isAos ? -24 : -44 }}
                initialPosition={weekView ? Positions.CLOSED : Positions.OPEN}
                markedDates={{
                  [selectedDate]: { selected: true },
                }}
                dayComponent={renderDayComponent}
                // customHeader={renderCustomHeader}
                // headerStyle={{ display: 'none' }}
                renderArrow={renderArrow}
                closeOnDayPress={false}
                allowShadow={false}
                hideKnob
                disablePan
              />
              <View style={{ marginHorizontal: 20 }}>
                <Divider style={styles.divider} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>{selectedDateKoreanString}</Text>
                  <TouchableOpacity onPress={handlePressPlusIcon}>
                    <PlusIcon />
                  </TouchableOpacity>
                </View>
              </View>
            </CalendarProvider>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 20,
  },
  profile: {
    gap: 16,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: theme.COLORS.STATUS.GREEN_90,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  iconWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  title: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  description: {
    fontSize: 14,
  },
  calendarWrap: {
    marginHorizontal: -20,
  },
  weekCalendarArrowWrap: {
    flexDirection: 'row',
    gap: 8,
  },
  selectedDay: {
    backgroundColor: theme.COLORS.DEFAULT.BLACK,
    borderRadius: 10,
  },
  selectedDayText: {
    color: theme.COLORS.DEFAULT.WHITE,
  },
  divider: {
    borderWidth: 0.5,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_400,
    marginVertical: 24,
  },
});
export { Home };
