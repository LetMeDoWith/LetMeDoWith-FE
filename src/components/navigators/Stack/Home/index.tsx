import React from 'react';

import { theme } from 'styles/theme';
import { createStackNavigator } from '@react-navigation/stack';
import { SettingStackNavigator } from 'components/navigators/Stack/Mypage';
import { BottomTabNavigator } from 'components/navigators/Tab/Home';
import { FeedbackStackNavigator } from 'components/navigators/Stack/Feedback';
import { TaskForm } from 'screens/Home/Task';
import { RealtimeNag } from 'screens/Feed/RealtimeNag';
import { Myinfo } from 'screens/Mypage/Setting/Myinfo';
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
        cardStyle: { backgroundColor: theme.COLORS.DEFAULT.WHITE },
      }}
    >
      <Screen name="HOME" component={BottomTabNavigator} options={{ headerShown: false }} />
      <Screen name="SETTING" component={SettingStackNavigator} options={{ headerShown: false }} />
      <Screen name="TASK_FORM" component={TaskForm} options={{ headerShown: false }} />
      <Screen name="FEEDBACK" component={FeedbackStackNavigator} options={{ headerShown: false }} />
      <Screen name="REALTIME_NAG" component={RealtimeNag} options={{ headerTitle: '실시간 잔소리하기' }} />
      <Screen name="MYINFO" component={Myinfo} options={{ headerTitle: '내 정보 관리' }} />
    </Navigator>
  );
};

export { HomeStackNavigator };
