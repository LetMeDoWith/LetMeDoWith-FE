import { createStackNavigator } from '@react-navigation/stack';

import { theme } from 'styles/theme';
import type { FeedbackStackParamList } from 'types/shared';
import { FeedbackTopTabNavigator } from 'components/navigators/Tab/Feedback';

const FeedbackStackNavigator = () => {
  const { Navigator, Screen } = createStackNavigator<FeedbackStackParamList>();
  return (
    <Navigator
      initialRouteName="DEFAULT"
      screenOptions={{
        headerTitle: '잔소리 내역',
        headerTitleAlign: 'center',
        headerTitleStyle: { ...theme.TYPOGRAPHY.TITLE_1 },
        headerBackTitleVisible: false,
        headerTintColor: theme.COLORS.DEFAULT.BLACK,
        headerShadowVisible: false,
        cardStyle: { backgroundColor: theme.COLORS.DEFAULT.WHITE },
      }}
    >
      <Screen name="DEFAULT" component={FeedbackTopTabNavigator} />
    </Navigator>
  );
};

export { FeedbackStackNavigator };
