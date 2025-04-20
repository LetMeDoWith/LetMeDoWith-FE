import { FormProvider, useForm } from 'react-hook-form';

import { TaskFormStackNavigator } from 'components/navigators/Stack/Task';

const TaskForm = () => {
  const methods = useForm({
    defaultValues: {
      title: '',
      taskCategoryId: null,
      startDateTime: '',
      isRoutine: false,
      routineStartDateTime: '',
      routineEndDateTime: '',
    },
  });

  return (
    <FormProvider {...methods}>
      <TaskFormStackNavigator />
    </FormProvider>
  );
};

export { TaskForm };
