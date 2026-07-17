import { useCallback } from 'react';
import { ScrollView } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import { FeedNagList, FeedNagEmpty, SuccessTaskImageList } from 'components/Feed';
import { PullToRefreshControl } from 'components/common/PullToRefreshControl';
import { useScheduledRefetch } from 'hooks/shared/useScheduledRefetch';
import { useFetchFeedbackAvailableDowithTasksInfinite } from 'hooks/queries/task/useFetchFeedbackAvailableDowithTasksInfinite';
import { TASK_QUERY_KEY } from 'constants/queries';

const Feed = () => {
  // 정시 기준 5분 간격(1분, 6분, ..., 56분)으로 피드 데이터 자동 refetch
  useScheduledRefetch([TASK_QUERY_KEY.FEEDBACK_AVAILABLE_DOWITH_TASKS, TASK_QUERY_KEY.SUCCESS_DOWITH_TASKS]);

  const queryClient = useQueryClient();
  const { data, isLoading } = useFetchFeedbackAvailableDowithTasksInfinite();
  const hasNagTasks = (data?.pages[0]?.data.dowithTasks.length ?? 0) > 0;

  const onRefresh = useCallback(
    () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY.FEEDBACK_AVAILABLE_DOWITH_TASKS }),
        queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY.SUCCESS_DOWITH_TASKS }),
      ]),
    [queryClient],
  );

  return (
    <ScrollView refreshControl={<PullToRefreshControl onRefresh={onRefresh} />}>
      {!isLoading && hasNagTasks && (
        <>
          <FeedNagList />
          <SuccessTaskImageList />
        </>
      )}
      {!isLoading && !hasNagTasks && <FeedNagEmpty />}
    </ScrollView>
  );
};

export { Feed };
