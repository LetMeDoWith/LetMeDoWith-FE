import React from 'react';

import { theme } from 'styles/theme';
import { createStackNavigator } from '@react-navigation/stack';
import { SettingStackNavigator } from 'components/navigators/Stack/Mypage';
import { BottomTabNavigator } from 'components/navigators/Tab/Home';
import { FeedbackStackNavigator } from 'components/navigators/Stack/Feedback';
import { TaskForm } from 'screens/Home/Task';
import { RealtimeNag } from 'screens/Feed/RealtimeNag';
import { ReceivedFeedback } from 'screens/Feedback/ReceivedFeedback';
import { CheerCollection } from 'screens/Feedback/CheerCollection';
import { Myinfo } from 'screens/Mypage/Setting/Myinfo';
import { NotificationScreen } from 'screens/Notification';
import type { RootStackParamList } from 'types/shared';
import { withScreenErrorBoundary } from 'components/common/ScreenErrorBoundary';

/* 화면 렌더 에러·핵심 데이터 첫 로딩 실패 시 내용 자리를 에러 화면으로 바꾼다(헤더·탭바는 유지) */
/* 할 일 수정은 headerShown: false(안쪽 스택이 헤더를 그림)라 맨 위부터 덮는다 */
const TaskFormScreen = withScreenErrorBoundary(TaskForm, { withSafeAreaTop: true, withBackButton: true });
const RealtimeNagScreen = withScreenErrorBoundary(RealtimeNag);
const MyinfoScreen = withScreenErrorBoundary(Myinfo);
const NotificationScreenScreen = withScreenErrorBoundary(NotificationScreen);
const ReceivedFeedbackScreen = withScreenErrorBoundary(ReceivedFeedback);
const CheerCollectionScreen = withScreenErrorBoundary(CheerCollection);

const HomeStackNavigator = () => {
  const { Navigator, Screen } = createStackNavigator<RootStackParamList>();

  return (
    <Navigator
      initialRouteName="HOME"
      screenOptions={{
        headerTitleAlign: 'center',
        headerTitleStyle: { ...theme.TYPOGRAPHY.TITLE_1 },
        headerBackTitleVisible: false,
        headerTintColor: theme.COLORS.DEFAULT.BLACK,
        headerShadowVisible: false,
        cardStyle: { backgroundColor: theme.COLORS.DEFAULT.WHITE },
      }}
    >
      <Screen name="HOME" component={BottomTabNavigator} options={{ headerShown: false }} />
      <Screen name="SETTING" component={SettingStackNavigator} options={{ headerShown: false }} />
      <Screen name="TASK_FORM" component={TaskFormScreen} options={{ headerShown: false }} />
      <Screen name="FEEDBACK" component={FeedbackStackNavigator} options={{ headerShown: false }} />
      <Screen name="REALTIME_NAG" component={RealtimeNagScreen} options={{ headerTitle: '실시간 잡도리하기' }} />
      <Screen name="MYINFO" component={MyinfoScreen} options={{ headerTitle: '내 정보 관리' }} />
      <Screen name="NOTIFICATION_LIST" component={NotificationScreenScreen} options={{ headerTitle: '알림' }} />
      <Screen
        name="RECEIVED_FEEDBACK"
        component={ReceivedFeedbackScreen}
        options={{ headerTitle: '잡도리 모아보기' }}
      />
      <Screen name="CHEER_COLLECTION" component={CheerCollectionScreen} options={{ headerTitle: '잡도리 모아보기' }} />
    </Navigator>
  );
};

export { HomeStackNavigator };
