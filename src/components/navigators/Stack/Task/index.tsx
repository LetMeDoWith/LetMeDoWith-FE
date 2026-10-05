import { createStackNavigator } from '@react-navigation/stack';

import { Form, RoutineForm } from 'components/Task';
import { theme } from 'styles/theme';
import type { TaskFormStackParamList, TaskModeType } from 'types/shared';
import { withScreenErrorBoundary } from 'components/common/ScreenErrorBoundary';

/* 화면 렌더 에러·핵심 데이터 첫 로딩 실패 시 내용 자리를 에러 화면으로 바꾼다(헤더·탭바는 유지) */
const FormScreen = withScreenErrorBoundary(Form);
const RoutineFormScreen = withScreenErrorBoundary(RoutineForm);

interface Props {
  id: number;
  mode?: TaskModeType;
  isRoutineTask?: boolean;
  initialScreen?: keyof TaskFormStackParamList;
}

const TaskFormStackNavigator = ({ id, isRoutineTask, mode, initialScreen = 'COMMON' }: Props) => {
  const { Navigator, Screen } = createStackNavigator<TaskFormStackParamList>();
  const isTodoMode = mode === 'TODO';

  const getScreenHeaderTitle = () => {
    if (!mode) {
      return 'DO 추가하기';
    }

    if (isTodoMode) {
      return '투두 수정하기';
    }

    return '도리 수정하기';
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
      <Screen name="COMMON" component={FormScreen} initialParams={{ id, mode, isRoutineTask }} />
      <Screen
        name="ROUTINE"
        component={RoutineFormScreen}
        initialParams={{ id, mode }}
        options={{
          headerTitle: '루틴 수정하기',
        }}
      />
    </Navigator>
  );
};

export { TaskFormStackNavigator };
