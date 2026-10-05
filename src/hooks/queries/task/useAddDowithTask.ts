import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiError } from 'services/apiClient';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { TASK_QUERY_KEY } from 'constants/queries';
import { addDowithTask } from 'services/rest/task';
import { updateOnboard } from 'services/rest/member';
import type { addTaskRequestSchemeType, fetchTaskCategoryListResponseSchemeType } from 'types/task/scheme/api';
import type { RootStackParamList } from 'types/shared';
import { useStore } from 'stores/index';
import { buildTaskCreateParams, logEvent } from 'utils/analytics';
import { captureApiError } from 'utils/sentry';

interface AddDowithTaskResult {
  /* 이번 등록으로 온보딩 완료 처리까지 끝나, 홈에서 온보딩을 띄워야 하는지 */
  showOnboarding: boolean;
}

interface Options {
  /*
   * 등록 후 처리. 바텀시트에서 등록하면 이미 홈이라 시트만 닫으면 되고,
   * 넘기지 않으면 기존 수정 화면처럼 홈으로 돌아간다.
   * 등록한 날짜로 화면을 옮길 수 있게 보낸 페이로드를 함께 넘긴다.
   */
  onSuccess?: (payload: addTaskRequestSchemeType, result: AddDowithTaskResult) => void;
}

/*
 * 도리를 만든 뒤, 아직 온보딩 전이면 온보딩 완료 처리(PUT)를 이어서 보낸다. 둘 다 끝난 뒤에 화면을 넘긴다.
 * - 생성이 성공했을 때만 PUT을 보낸다. 함께 보내면 생성이 실패해도 서버에 완료가 남아
 *   온보딩을 한 번도 못 본 채 끝날 수 있다(되돌리는 API가 없다).
 * - 생성만 성공하고 PUT이 실패하면 등록은 성공으로 두되 온보딩은 띄우지 않는다.
 *   서버에 완료가 남지 않았으므로 다음 도리 등록 때 다시 시도된다.
 * PUT 실패는 mutation 에러가 아니라 전역 구독에 잡히지 않으므로 여기서 직접 보고한다.
 */
const addDowithTaskWithOnboarding = async (payload: addTaskRequestSchemeType): Promise<AddDowithTaskResult> => {
  await addDowithTask(payload);

  if (useStore.getState().isOnBoarded) {
    return { showOnboarding: false };
  }

  try {
    await updateOnboard();
    return { showOnboarding: true };
  } catch (error) {
    captureApiError(error, 'mutation');
    return { showOnboarding: false };
  }
};

const useAddDowithTask = ({ onSuccess }: Options = {}) => {
  const queryClient = useQueryClient();
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList, 'TASK_FORM'>>();

  return useMutation<AddDowithTaskResult, ApiError, addTaskRequestSchemeType>({
    mutationKey: TASK_QUERY_KEY.ADD_DOWITH,
    mutationFn: addDowithTaskWithOnboarding,
    onSuccess: (result, payload) => {
      const categories = queryClient.getQueryData<fetchTaskCategoryListResponseSchemeType>(
        TASK_QUERY_KEY.CATEGORY_LIST,
      )?.data;
      logEvent('dori_create_complete', buildTaskCreateParams(payload, categories));

      /*
       * member API를 다시 받기 전에 도리를 하나 더 등록해도 PUT·온보딩이 반복되지 않게
       * 로컬 사본을 먼저 맞춘다(서버 값과의 동기화는 홈이 온보딩을 띄운 뒤 invalidate로 한다).
       */
      if (result.showOnboarding) {
        useStore.getState().onboardingActions.setIsOnBoarded(true);
      }

      if (onSuccess) {
        onSuccess(payload, result);
      } else {
        navigate('HOME', { screen: 'MYTODO', params: { showOnboarding: result.showOnboarding } });
      }

      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY.LIST });
    },
  });
};

export { useAddDowithTask };
export type { AddDowithTaskResult };
