import { FormProvider, useForm } from 'react-hook-form';
import dayjs from 'dayjs';

import { TaskFormStackNavigator } from 'components/navigators/Stack/Task';
import type { addTodoTaskRequestSchemeType } from 'types/task/scheme/api';

const TaskForm = () => {
  const methods = useForm<addTodoTaskRequestSchemeType>({
    defaultValues: {
      title: '',
      taskCategoryId: null,
      date: dayjs().format('YYYY-MM-DD'),
      startTime: null,
      routineCondition: {
        startDate: null,
        endDate: null,
        cycle: null,
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
