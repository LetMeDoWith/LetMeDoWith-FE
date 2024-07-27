import React from 'react';

import { theme } from 'styles/theme';
import { createStackNavigator } from '@react-navigation/stack';
import { SettingStackNavigator } from 'components/navigators/Stack/Mypage';
import { BottomTabNavigator } from 'components/navigators/Tab/Home';
import type { RootStackParamList } from 'types/shared';

const HomeStackNavigator = () => {
  const { Navigator, Screen } = createStackNavigator<RootStackParamList>();

  return (
    <Navigator
      initialRouteName="HOME"
      screenOptions={{
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
        headerTintColor: theme.COLORS.DEFAULT.BLACK,
      }}
    >
      <Screen name="HOME" component={BottomTabNavigator} options={{ headerShown: false }} />
      <Screen name="SETTING" component={SettingStackNavigator} options={{ headerShown: false }} />
    </Navigator>
  );
};

export { HomeStackNavigator };
