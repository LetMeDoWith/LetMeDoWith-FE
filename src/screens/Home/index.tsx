import React, { useEffect } from 'react';
import { Image, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from 'styles/theme';
import { TrafficGreenLight } from 'components/common/icons/TrafficGreenLight';
import { Notification } from 'components/common/icons/Notification';
import { isAos } from 'utils/device';

const Home = () => {
  const { top } = useSafeAreaInsets();

  const handleBadge = () => {
    console.log('대표 뱃지 클릭');
  };

  const handlePressNotificationIcon = () => {
    console.log('알림 버튼 클릭');
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
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
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
});
export { Home };
