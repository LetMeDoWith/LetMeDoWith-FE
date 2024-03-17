import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import useTheme from '@hooks/shared/useTheme';
import { Feed } from '@screens/Feed';
import { Home } from '@screens/Home';
import { Mypage } from '@screens/Mypage';
import { HomeIcon } from '@components/common/icons/HomeIcon';
import { FeedIcon } from '@components/common/icons/FeedIcon';
import { MypageIcon } from '@components/common/icons/MypageIcon';

const BottomTabNavigator = () => {
  const { Navigator, Screen } = createBottomTabNavigator();
  const {
    COLORS: { DEFAULT, PRIMARY, GRAY_SCALE },
  } = useTheme();

  return (
    <Navigator
      initialRouteName="마이투두"
      screenOptions={{
        headerTitleAlign: 'center',
        tabBarActiveTintColor: PRIMARY.RED_500,
      }}
    >
      <Screen
        name="둘러보기"
        component={Feed}
        options={{
          tabBarIcon: ({ focused }) => (
            <FeedIcon
              fill={focused ? PRIMARY.RED_500 : DEFAULT.WHITE}
              stroke={focused ? PRIMARY.RED_500 : GRAY_SCALE.GRAY_600}
              fillRect={focused ? DEFAULT.WHITE : GRAY_SCALE.GRAY_600}
            />
          ),
        }}
      />
      <Screen
        name="마이투두"
        component={Home}
        options={{
          tabBarIcon: ({ focused }) => (
            <HomeIcon
              fill={focused ? PRIMARY.RED_500 : DEFAULT.WHITE}
              stroke={focused ? PRIMARY.RED_500 : GRAY_SCALE.GRAY_600}
            />
          ),
        }}
      />
      <Screen
        name="내정보"
        component={Mypage}
        options={{
          tabBarIcon: ({ focused }) => (
            <MypageIcon
              fill={focused ? PRIMARY.RED_500 : DEFAULT.WHITE}
              stroke={focused ? PRIMARY.RED_500 : GRAY_SCALE.GRAY_600}
            />
          ),
        }}
      />
    </Navigator>
  );
};

export { BottomTabNavigator };
