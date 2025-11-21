import { FormProvider, useForm } from 'react-hook-form';

import { TaskFormStackNavigator } from 'components/navigators/Stack/Task';
import type { taskFormSchemeType } from 'types/task/scheme/api';
import type { RootStackScreenProps } from 'types/shared';
import { useFetchTodoTask } from 'hooks/queries/task/useFetchTodoTask';
import { useFetchDowithTask } from 'hooks/queries/task/useFetchDowithTask';

const TaskForm = ({
  route: {
    params: { date, id = -1, mode, screen },
  },
}: RootStackScreenProps<'TASK_FORM'>) => {
  const { data: todoTaskData } = useFetchTodoTask({ todoTaskId: id }, { enabled: mode === 'TODO' && id !== -1 });
  const { data: dowithTaskData } = useFetchDowithTask(
    { dowithTaskId: id },
    { enabled: mode === 'DOWITH' && id !== -1 },
  );

  const data = id && mode ? todoTaskData ?? dowithTaskData : null;
  const methods = useForm<taskFormSchemeType>({
    defaultValues: {
      title: data?.title || '',
      taskCategoryId: data?.taskCategoryId || null,
      date: data?.date || date,
      startTime: data?.startTime || null,
      routineCondition: data?.routineCondition || {
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
      <TaskFormStackNavigator id={id} mode={mode} initialScreen={screen} />
    </FormProvider>
  );
};

export { TaskForm };
