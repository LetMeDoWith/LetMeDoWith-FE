import type { ApiError } from 'services/apiClient';
import { useQuery } from '@tanstack/react-query';

import { TASK_QUERY_KEY } from 'constants/queries';
import { fetchSuccessDowithTasks } from 'services/rest/task';
import type { PageRequestSchemeType } from 'types/shared/scheme/api';
import type { fetchSuccessDowithTasksResponseSchemeType, successDowithTaskSchemeType } from 'types/task/scheme/api';
import { toThrowOnError, type BoundaryQueryOptions } from 'utils/error';

const useFetchSuccessDowithTasks = (params?: PageRequestSchemeType, { throwOnError }: BoundaryQueryOptions = {}) =>
  useQuery<fetchSuccessDowithTasksResponseSchemeType, ApiError, successDowithTaskSchemeType[]>({
    queryKey: [...TASK_QUERY_KEY.SUCCESS_DOWITH_TASKS, params?.page, params?.size],
    queryFn: () => fetchSuccessDowithTasks(params),
    select: data => data.data.successDowithTasks,
    /*
     * 둘러보기는 화면이 먼저 요청을 시작해 두고, 목록 컴포넌트는 잡도리 목록이 온 뒤에 마운트된다.
     * staleTime이 0이면 그 사이 받은 응답을 낡은 것으로 보고 다시 요청하므로 잠깐 신선하게 둔다.
     * 새로고침·5분 자동 갱신·좋아요는 invalidate라 이 값과 무관하게 바로 다시 받는다.
     */
    staleTime: 60 * 1000,
    throwOnError: toThrowOnError(throwOnError),
  });

export { useFetchSuccessDowithTasks };
