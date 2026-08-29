import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import useTheme from 'hooks/shared/useTheme';
import { Feed } from 'screens/Feed';
import { Home } from 'screens/Home';
import { Mypage } from 'screens/Mypage';
import { HomeIcon } from 'components/common/icons/HomeIcon';
import { FeedIcon } from 'components/common/icons/FeedIcon';
import { MypageIcon } from 'components/common/icons/MypageIcon';
import { Notification } from 'components/common/icons/Notification';
import { NotificationOn } from 'components/common/icons/NotificationOn';
import { SettingsIcon } from 'components/common/icons/SettingsIcon';
import { useFetchNotifications } from 'hooks/queries/notification/useFetchNotifications';
import { theme } from 'styles/theme';
import type { HomeTabParamList, RootStackScreenProps } from 'types/shared';

const MypageHeaderRight = ({ onNotification, onSetting }: { onNotification: () => void; onSetting: () => void }) => {
  const { data: normalData } = useFetchNotifications('NORMAL');
  const { data: eventData } = useFetchNotifications('EVENT');

  const hasUnread =
    (normalData?.pages.some(page => page.data.notifications.some(n => !n.isConfirmed)) ?? false) ||
    (eventData?.pages.some(page => page.data.notifications.some(n => !n.isConfirmed)) ?? false);

  return (
    <View style={styles.headerRight}>
      <Pressable onPress={onNotification} hitSlop={8}>
        {hasUnread ? <NotificationOn width={24} height={24} /> : <Notification width={24} height={24} />}
      </Pressable>
      <Pressable onPress={onSetting} hitSlop={8}>
        <SettingsIcon width={24} height={24} />
      </Pressable>
    </View>
  );
};

const BottomTabNavigator = ({ navigation }: RootStackScreenProps<'HOME'>) => {
  const { Navigator, Screen } = createBottomTabNavigator<HomeTabParamList>();
  const {
    COLORS: { GRAY_SCALE },
  } = useTheme();

  return (
    <Navigator
      initialRouteName="MYTODO"
      screenOptions={{
        headerTitleAlign: 'center',
        headerTitleStyle: { ...theme.TYPOGRAPHY.TITLE_1 },
        headerShadowVisible: false,
        tabBarActiveTintColor: GRAY_SCALE.GRAY_20,
        tabBarStyle: { borderTopWidth: 0, elevation: 0 },
        tabBarLabelStyle: {
          fontSize: 11,
          lineHeight: 14,
        },
      }}
      sceneContainerStyle={{
        backgroundColor: theme.COLORS.DEFAULT.WHITE,
      }}
    >
      <Screen
        name="FEED"
        component={Feed}
        options={{
          headerTitle: '둘러보기',
          headerTitleAlign: 'left',
          headerTitleStyle: { ...theme.TYPOGRAPHY.HEADER },
          tabBarLabel: '둘러보기',
          tabBarIcon: ({ focused }) => (
            <FeedIcon
              fill={focused ? GRAY_SCALE.GRAY_20 : GRAY_SCALE.GRAY_80}
              stroke={focused ? GRAY_SCALE.GRAY_20 : GRAY_SCALE.GRAY_80}
              fillRect={focused ? GRAY_SCALE.GRAY_80 : GRAY_SCALE.GRAY_80}
            />
          ),
        }}
      />
      <Screen
        name="MYTODO"
        component={Home}
        options={{
          headerShown: false,
          tabBarLabel: '홈',
          tabBarIcon: ({ focused }) => (
            <HomeIcon
              fill={focused ? GRAY_SCALE.GRAY_20 : GRAY_SCALE.GRAY_80}
              stroke={focused ? GRAY_SCALE.GRAY_20 : GRAY_SCALE.GRAY_80}
            />
          ),
        }}
      />
      <Screen
        name="MYPAGE"
        component={Mypage}
        options={{
          headerTitle: '마이두윗',
          headerTitleAlign: 'left',
          tabBarLabel: '마이두윗',
          tabBarIcon: ({ focused }) => (
            <MypageIcon
              fill={focused ? GRAY_SCALE.GRAY_20 : GRAY_SCALE.GRAY_80}
              stroke={focused ? GRAY_SCALE.GRAY_20 : GRAY_SCALE.GRAY_80}
            />
          ),
          headerRight: () => (
            <MypageHeaderRight
              onNotification={() => navigation.navigate('NOTIFICATION_LIST')}
              onSetting={() => navigation.navigate('SETTING')}
            />
          ),
        }}
      />
    </Navigator>
  );
};

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 20,
  },
});

export { BottomTabNavigator };
