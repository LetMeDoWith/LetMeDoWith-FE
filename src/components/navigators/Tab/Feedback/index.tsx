import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { ReceiveFeedback, SendFeedback } from 'screens/Feedback';
import { FeedbackTabParamList } from 'types/shared';
import { theme } from 'styles/theme';

const FeedbackTopTabNavigator = () => {
  const Tab = createMaterialTopTabNavigator<FeedbackTabParamList>();

  return (
    <Tab.Navigator
      sceneContainerStyle={{ backgroundColor: theme.COLORS.DEFAULT.WHITE, paddingVertical: 24, paddingHorizontal: 20 }}
      screenOptions={{
        tabBarIndicatorStyle: { backgroundColor: theme.COLORS.DEFAULT.BLACK },
      }}
    >
      <Tab.Screen name="RECEIVE" component={ReceiveFeedback} options={{ tabBarLabel: '받은 잔소리' }} />
      <Tab.Screen name="SEND" component={SendFeedback} options={{ tabBarLabel: '보낸 잔소리' }} />
    </Tab.Navigator>
  );
};

export { FeedbackTopTabNavigator };
