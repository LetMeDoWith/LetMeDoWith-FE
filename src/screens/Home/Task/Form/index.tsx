import { FormProvider, useForm } from 'react-hook-form';

import { TaskFormStackNavigator } from 'components/navigators/Stack/Task';
import type { addTaskRequestSchemeType } from 'types/task/scheme/api';
import type { RootStackScreenProps } from 'types/shared';
import { useFetchTodoTask } from 'hooks/queries/task/useFetchTodoTask';
import { useFetchDowithTask } from 'hooks/queries/task/useFetchDowithTask';

const TaskForm = ({
  route: {
    params: { date, id = -1, mode },
  },
}: RootStackScreenProps<'TASK_FORM'>) => {
  const { data: todoTaskData } = useFetchTodoTask({ todoTaskId: id }, { enabled: mode === 'TODO' && id !== -1 });
  const { data: dowithTaskData } = useFetchDowithTask(
    { dowithTaskId: id },
    { enabled: mode === 'DOWITH' && id !== -1 },
  );

  const data = id && mode ? todoTaskData ?? dowithTaskData : null;
  const methods = useForm<addTaskRequestSchemeType>({
    defaultValues: {
      title: data ? data.title : '',
      taskCategoryId: data ? data.taskCategoryId : null,
      date: data ? data.date : date,
      startTime: data ? data.startTime : null,
      routineCondition: data
        ? data.routineCondition
        : {
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
      <TaskFormStackNavigator id={id} mode={mode} />
    </FormProvider>
  );
};

export { TaskForm };
