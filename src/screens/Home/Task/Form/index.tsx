import { FormProvider, useForm } from 'react-hook-form';
import dayjs from 'dayjs';

import { TaskFormStackNavigator } from 'components/navigators/Stack/Task';
import type { addTaskRequestSchemeType } from 'types/task/scheme/api';

const TaskForm = () => {
  const methods = useForm<addTaskRequestSchemeType>({
    defaultValues: {
      title: '',
      taskCategoryId: null,
      date: dayjs().format('YYYY-MM-DD'),
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
