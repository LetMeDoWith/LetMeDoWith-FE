import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiError } from 'services/apiClient';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { TASK_QUERY_KEY } from 'constants/queries';
import { addTodoTask } from 'services/rest/task';
import type { addTaskRequestSchemeType, fetchTaskCategoryListResponseSchemeType } from 'types/task/scheme/api';
import type { RootStackParamList } from 'types/shared';
import { buildTaskCreateParams, logEvent } from 'utils/analytics';

interface Options {
  /*
   * 등록 후 처리. 바텀시트에서 등록하면 이미 홈이라 시트만 닫으면 되고,
   * 넘기지 않으면 기존 수정 화면처럼 홈으로 돌아간다.
   */
  onSuccess?: () => void;
}

const useAddTodoTask = ({ onSuccess }: Options = {}) => {
  const queryClient = useQueryClient();
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList, 'TASK_FORM'>>();

  return useMutation<undefined, ApiError, addTaskRequestSchemeType>({
    mutationKey: TASK_QUERY_KEY.ADD_TODO,
    mutationFn: payload => addTodoTask(payload),
    onSuccess: (_, payload) => {
      const categories = queryClient.getQueryData<fetchTaskCategoryListResponseSchemeType>(
        TASK_QUERY_KEY.CATEGORY_LIST,
      )?.data;
      logEvent('todo_create_complete', buildTaskCreateParams(payload, categories));

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('HOME');
      }

      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY.LIST });
    },
  });
};

export { useAddTodoTask };
