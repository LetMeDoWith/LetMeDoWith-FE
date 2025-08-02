import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { TASK_QUERY_KEY } from 'constants/queries';
import { addDowithTask } from 'services/rest/task';
import type { addTodoTaskRequestSchemeType } from 'types/task/scheme/api';
import type { RootStackParamList } from 'types/shared';

const useAddDowithTask = () => {
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList, 'TASK_FORM'>>();

  return useMutation<string, AxiosError, addTodoTaskRequestSchemeType>({
    mutationKey: TASK_QUERY_KEY.ADD_DOWITH,
    mutationFn: payload => addDowithTask(payload),
    onSuccess: async response => {
      console.log('두윗 등록 성공!: ', response);
      navigate('HOME');
      // TODO: 테스크 리스트 query invalidate 필요
    },
    onError: e => {
      console.error('두윗 등록 실패 ', e.response?.data);
    },
  });
};

export { useAddDowithTask };
