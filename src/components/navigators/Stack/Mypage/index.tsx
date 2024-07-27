import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { theme } from 'styles/theme';
import { Setting } from 'screens/Mypage/Setting';
import { Myinfo } from 'screens/Mypage/Setting/Myinfo';
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
      }}
    >
      <Screen name="DEFAULT" component={Setting} options={{ headerTitle: '설정' }} />
      <Screen name="MYINFO" component={Myinfo} options={{ headerTitle: '내 정보 관리' }} />
    </Navigator>
  );
};

export { SettingStackNavigator };
