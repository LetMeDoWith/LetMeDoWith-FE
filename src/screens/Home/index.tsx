import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import dayjs from 'dayjs';
import { Divider } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarProvider, ExpandableCalendar } from 'react-native-calendars';
import { LocaleConfig } from 'react-native-calendars/src';
import { Positions } from 'react-native-calendars/src/expandableCalendar';
import type { DateData, Direction } from 'react-native-calendars/src/types';
import type { DayProps } from 'react-native-calendars/src/calendar/day';
import { Shadow } from 'react-native-shadow-2';
import LinearGradient from 'react-native-linear-gradient';

import { theme } from 'styles/theme';
import { TrafficGreenLight } from 'components/common/icons/TrafficGreenLight';
import { isAos } from 'utils/device';
import { ArrowLeft } from 'components/common/icons/ArrowIcon';
import { ArrowRight } from 'components/common/icons/ArrowIcon';
import { PlusIcon } from 'components/common/icons/PlusIcon';
import { ListContainerView } from 'components/Task/ListContainerView';
import type { HomeTabScreenProps } from 'types/shared';
import { FeedbackNotification } from 'components/common/icons/FeedbackNotification';

LocaleConfig.locales.kr = {
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

  const handlePressNotification = () => {
    navigate('FEEDBACK');
  };

  const handlePressPlusIcon = () => {
    navigate('TASK_FORM');
  };

  const handleDayPress = (date?: DateData) => () => {
    if (!date) {
      return;
    }

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
              <TrafficGreenLight />
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
            <View style={styles.contentHeader}>
              <Pressable
                style={{
                  backgroundColor: weekView ? theme.COLORS.GRAY_SCALE.GRAY_96 : theme.COLORS.DEFAULT.WHITE,
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
                <View style={{ flex: 1, marginHorizontal: 20 }}>
                  <Divider style={styles.divider} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>{selectedDateKoreanString}</Text>
                    <TouchableOpacity onPress={handlePressPlusIcon}>
                      <PlusIcon />
                    </TouchableOpacity>
                  </View>
                  <View style={{ flex: 1, marginTop: 16 }}>
                    <ListContainerView selectedDate={selectedDate} />
                  </View>
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
    justifyContent: 'space-between',
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
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_92,
    marginVertical: 24,
  },
});
export { Home };
