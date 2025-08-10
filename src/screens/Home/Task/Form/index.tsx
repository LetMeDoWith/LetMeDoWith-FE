import { FormProvider, useForm } from 'react-hook-form';

import { TaskFormStackNavigator } from 'components/navigators/Stack/Task';
import type { addTaskRequestSchemeType } from 'types/task/scheme/api';
import type { RootStackScreenProps } from 'types/shared';

const TaskForm = ({
  route: {
    params: { date },
  },
}: RootStackScreenProps<'TASK_FORM'>) => {
  const methods = useForm<addTaskRequestSchemeType>({
    defaultValues: {
      title: '',
      taskCategoryId: null,
      date,
      startTime: null,
      routineCondition: {
        startDate: undefined,
        endDate: undefined,
        cycle: undefined,
        pattern: [],
        isExcludeHolidays: false,
      },
    },
  });

  return (
    <FormProvider {...methods}>
      <TaskFormStackNavigator />
    </FormProvider>
  );
};

export { TaskForm };
