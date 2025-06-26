import { FormProvider, useForm } from 'react-hook-form';
import dayjs from 'dayjs';

import { TaskFormStackNavigator } from 'components/navigators/Stack/Task';

const TaskForm = () => {
  const methods = useForm({
    defaultValues: {
      title: '',
      taskCategoryId: null,
      date: dayjs().format('YYYY-MM-DD'),
      startTime: '',
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
