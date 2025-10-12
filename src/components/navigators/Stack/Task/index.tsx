import { createStackNavigator } from '@react-navigation/stack';

import { Form } from 'components/Task';
import { theme } from 'styles/theme';
import type { TaskFormStackParamList, TaskModeType } from 'types/shared';

interface Props {
  mode?: TaskModeType;
}

const TaskFormStackNavigator = ({ mode }: Props) => {
  const { Navigator, Screen } = createStackNavigator<TaskFormStackParamList>();
  return (
    <Navigator
      initialRouteName="FORM"
      screenOptions={{
        headerTitle: `할 일 ${mode ? '수정' : '추가'}하기`,
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
        headerTintColor: theme.COLORS.DEFAULT.BLACK,
        cardStyle: { backgroundColor: theme.COLORS.DEFAULT.WHITE },
      }}
    >
      <Screen name="FORM" component={Form} initialParams={{ mode }} />
    </Navigator>
  );
};

export { TaskFormStackNavigator };
