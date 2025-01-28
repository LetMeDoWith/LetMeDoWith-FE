import { createStackNavigator } from '@react-navigation/stack';
import { Form } from 'components/Task';
import { theme } from 'styles/theme';

const TaskFormStackNavigator = () => {
  const { Navigator, Screen } = createStackNavigator();
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
    </Navigator>
  );
};

export { TaskFormStackNavigator };
