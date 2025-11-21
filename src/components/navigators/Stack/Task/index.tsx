import { createStackNavigator } from '@react-navigation/stack';

import { Form, RoutineForm } from 'components/Task';
import { theme } from 'styles/theme';
import type { TaskFormStackParamList, TaskModeType } from 'types/shared';

interface Props {
  id: number;
  mode?: TaskModeType;
  initialScreen?: keyof TaskFormStackParamList;
}

const TaskFormStackNavigator = ({ id, mode, initialScreen = 'COMMON' }: Props) => {
  const { Navigator, Screen } = createStackNavigator<TaskFormStackParamList>();
  return (
    <Navigator
      initialRouteName={initialScreen}
      screenOptions={{
        headerTitle: `할 일 ${mode ? '수정' : '추가'}하기`,
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
        headerTintColor: theme.COLORS.DEFAULT.BLACK,
        cardStyle: { backgroundColor: theme.COLORS.DEFAULT.WHITE },
      }}
    >
      <Screen name="COMMON" component={Form} initialParams={{ id, mode }} />
      <Screen
        name="ROUTINE"
        component={RoutineForm}
        initialParams={{ id, mode }}
        options={{
          headerTitle: '루틴 수정하기',
        }}
      />
    </Navigator>
  );
};

export { TaskFormStackNavigator };
