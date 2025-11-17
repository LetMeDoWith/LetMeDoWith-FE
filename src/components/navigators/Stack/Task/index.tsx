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
  const isTodoMode = mode === 'TODO';

  const getScreenHeaderTitle = () => {
    if (!mode) {
      return 'DO 추가하기';
    }

    if (isTodoMode) {
      return 'TO DO 수정하기';
    }

    return 'DO WITH 수정하기';
  };

  return (
    <Navigator
      initialRouteName={initialScreen}
      screenOptions={{
        headerTitle: getScreenHeaderTitle(),
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
