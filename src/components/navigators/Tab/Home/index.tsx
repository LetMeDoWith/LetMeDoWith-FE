import React from 'react';
import { Pressable, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import useTheme from 'hooks/shared/useTheme';
import { Feed } from 'screens/Feed';
import { Home } from 'screens/Home';
import { Mypage } from 'screens/Mypage';
import { HomeIcon } from 'components/common/icons/HomeIcon';
import { FeedIcon } from 'components/common/icons/FeedIcon';
import { MypageIcon } from 'components/common/icons/MypageIcon';
import { Notification } from 'components/common/icons/Notification';
import { SettingsIcon } from 'components/common/icons/SettingsIcon';
import { theme } from 'styles/theme';
import type { HomeTabParamList, RootStackScreenProps } from 'types/shared';

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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginRight: 20 }}>
              <Pressable onPress={() => navigation.navigate('NOTIFICATION_LIST')} hitSlop={8}>
                <Notification width={24} height={24} />
              </Pressable>
              <Pressable onPress={() => navigation.navigate('SETTING')} hitSlop={8}>
                <SettingsIcon width={24} height={24} />
              </Pressable>
            </View>
          ),
        }}
      />
    </Navigator>
  );
};

export { BottomTabNavigator };
