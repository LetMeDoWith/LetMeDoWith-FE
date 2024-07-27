import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { theme } from 'styles/theme';
import { Setting } from 'screens/Mypage/Setting';
import { Myinfo } from 'screens/Mypage/Setting/Myinfo';
import { Notification } from 'screens/Mypage/Setting/Notification';
import { Policy } from 'screens/Mypage/Setting/Policy';
import type { SettingStackParamList } from 'types/shared';

const SettingStackNavigator = () => {
  const { Navigator, Screen } = createStackNavigator<SettingStackParamList>();
  return (
    <Navigator
      initialRouteName="DEFAULT"
      screenOptions={{
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
        headerTintColor: theme.COLORS.DEFAULT.BLACK,
        headerShadowVisible: false,
      }}
    >
      <Screen name="DEFAULT" component={Setting} options={{ headerTitle: '설정' }} />
      <Screen name="MYINFO" component={Myinfo} options={{ headerTitle: '내 정보 관리' }} />
      <Screen name="NOTIFICATION" component={Notification} options={{ headerTitle: '알림설정' }} />
      <Screen name="POLICY" component={Policy} options={{ headerTitle: '이용약관' }} />
    </Navigator>
  );
};

export { SettingStackNavigator };
