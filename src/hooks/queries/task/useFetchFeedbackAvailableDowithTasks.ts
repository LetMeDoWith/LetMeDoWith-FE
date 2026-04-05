import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';

import { TASK_QUERY_KEY } from 'constants/queries';
import { fetchFeedbackAvailableDowithTasks } from 'services/rest/task';
import type { PageRequestSchemeType } from 'types/shared/scheme/api';
import type {
  fetchFeedbackAvailableDowithTasksResponseSchemeType,
  feedbackAvailableDowithTaskSchemeType,
} from 'types/task/scheme/api';

type FeedbackAvailableDowithTasksResult = {
  dowithTasks: feedbackAvailableDowithTaskSchemeType[];
  totalCount: number;
};

const useFetchFeedbackAvailableDowithTasks = (params?: PageRequestSchemeType) =>
  useQuery<fetchFeedbackAvailableDowithTasksResponseSchemeType, AxiosError, FeedbackAvailableDowithTasksResult>({
    queryKey: [...TASK_QUERY_KEY.FEEDBACK_AVAILABLE_DOWITH_TASKS, params?.page, params?.size],
    queryFn: () => fetchFeedbackAvailableDowithTasks(params),
    select: data => ({
      dowithTasks: data.data.dowithTasks,
      totalCount: data.totalCount,
    }),
  });

export { useFetchFeedbackAvailableDowithTasks };
