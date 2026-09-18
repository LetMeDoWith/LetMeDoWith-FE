import { useEffect, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { TaskFormStackNavigator } from 'components/navigators/Stack/Task';
import type { taskFormSchemeType } from 'types/task/scheme/api';
import type { RootStackScreenProps } from 'types/shared';
import { useFetchTodoTask } from 'hooks/queries/task/useFetchTodoTask';
import { useFetchDowithTask } from 'hooks/queries/task/useFetchDowithTask';

const EMPTY_ROUTINE_CONDITION = {
  startDate: null,
  endDate: null,
  cycle: null,
  pattern: [],
  isExcludeHolidays: false,
};

const TaskForm = ({
  route: {
    params: { date, id = -1, mode, screen, isRoutineTask },
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
      title: '',
      taskCategoryId: null,
      date,
      startTime: null,
      routineCondition: EMPTY_ROUTINE_CONDITION,
    },
  });

  /*
   * defaultValues는 첫 렌더에서 한 번만 읽힌다. 상세 조회가 끝나기 전에 들어오면 빈 값으로 굳어
   * 뒤늦게 온 응답이 반영되지 않는다 — 캐시가 있으면 채워지고 없으면 비어 간헐적으로 보인다.
   *
   * 값이 도착한 첫 순간에만 채운다. 이 쿼리는 키가 TASK_QUERY_KEY.LIST 아래라 홈의 주기적
   * refetch에 함께 딸려오는데, 매번 폼에 반영하면 수정 중이던 입력이 지워진다.
   */
  const { reset } = methods;
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!data || isInitialized.current) {
      return;
    }

    isInitialized.current = true;
    reset({
      title: data.title || '',
      taskCategoryId: data.taskCategoryId || null,
      date: data.date || date,
      startTime: data.startTime || null,
      routineCondition: data.routineCondition || EMPTY_ROUTINE_CONDITION,
    });
  }, [data, date, reset]);

  return (
    <FormProvider {...methods}>
      <TaskFormStackNavigator id={id} mode={mode} isRoutineTask={isRoutineTask} initialScreen={screen} />
    </FormProvider>
  );
};

export { TaskForm };
