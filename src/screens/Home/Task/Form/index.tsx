import { FormProvider, useForm } from 'react-hook-form';

import { TaskFormStackNavigator } from 'components/navigators/Stack/Task';

const TaskForm = () => {
  const methods = useForm({
    defaultValues: {
      title: '',
      taskCategoryId: -1,
      startDateTime: '',
      isRoutine: false,
      routineDates: [],
    },
  });

  return (
    <FormProvider {...methods}>
      <TaskFormStackNavigator />
    </FormProvider>
  );
};

export { TaskForm };
