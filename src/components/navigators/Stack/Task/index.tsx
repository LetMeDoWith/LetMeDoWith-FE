import { createStackNavigator } from '@react-navigation/stack';

import { Form, RoutineForm } from 'components/Task';
import { theme } from 'styles/theme';
import type { TaskFormStackParamList } from 'types/shared';

const TaskFormStackNavigator = () => {
  const { Navigator, Screen } = createStackNavigator<TaskFormStackParamList>();
  return (
    <Navigator
      initialRouteName="FORM"
      screenOptions={{
        headerTitle: '할 일 추가하기',
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
        headerTintColor: theme.COLORS.DEFAULT.BLACK,
        cardStyle: { backgroundColor: theme.COLORS.DEFAULT.WHITE },
      }}
    >
      <Screen name="FORM" component={Form} />
      <Screen name="ROUTINE_FORM" component={RoutineForm} options={{ headerTitle: '루틴 등록하기' }} />
    </Navigator>
  );
};

export { TaskFormStackNavigator };
