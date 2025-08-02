import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { TASK_QUERY_KEY } from 'constants/queries';
import { addTodoTask } from 'services/rest/task';
import type { addTaskRequestSchemeType, addTodoTaskResponseSchemeType } from 'types/task/scheme/api';
import type { RootStackParamList } from 'types/shared';

const useAddTodoTask = () => {
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList, 'TASK_FORM'>>();

  return useMutation<addTodoTaskResponseSchemeType, AxiosError, addTaskRequestSchemeType>({
    mutationKey: TASK_QUERY_KEY.ADD_TODO,
    mutationFn: payload => addTodoTask(payload),
    onSuccess: async ({ data }) => {
      console.log('투두 등록 성공!: ', data);
      navigate('HOME');
      // TODO: 테스크 리스트 query invalidate 필요
    },
    onError: e => {
      console.error('투두 등록 실패 ', e.response?.data);
    },
  });
};

export { useAddTodoTask };
