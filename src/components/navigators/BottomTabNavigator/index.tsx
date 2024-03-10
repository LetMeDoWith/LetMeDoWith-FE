import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Feed } from '@screens/Feed';
import { Home } from '@screens/Home';
import { Mypage } from '@screens/Mypage';
import { HomeIcon } from '@components/common/icons/HomeIcon';
import { FeedIcon } from '@components/common/icons/FeedIcon';
import { MypageIcon } from '@components/common/icons/MypageIcon';

const BottomTabNavigator = () => {
  const { Navigator, Screen } = createBottomTabNavigator();

  return (
    <Navigator
      initialRouteName="마이투두"
      screenOptions={{
        headerTitleAlign: 'center',
        tabBarActiveTintColor: '#FB4930',
      }}
    >
      <Screen
        name="둘러보기"
        component={Feed}
        options={{
          tabBarIcon: ({ focused }) => (
            <FeedIcon
              fill={focused ? '#FB493D' : '#FFF'}
              stroke={focused ? '#FB4930' : '#AEB6BE'}
              fillRect={focused ? '#FFF' : '#AEB6BE'}
            />
          ),
        }}
      />
      <Screen
        name="마이투두"
        component={Home}
        options={{
          tabBarIcon: ({ focused }) => (
            <HomeIcon fill={focused ? '#FB493D' : '#FFF'} stroke={focused ? '#FB4930' : '#AEB6BE'} />
          ),
        }}
      />
      <Screen
        name="내정보"
        component={Mypage}
        options={{
          tabBarIcon: ({ focused }) => (
            <MypageIcon fill={focused ? '#FB493D' : '#FFF'} stroke={focused ? '#FB4930' : '#AEB6BE'} />
          ),
        }}
      />
    </Navigator>
  );
};

export { BottomTabNavigator };
