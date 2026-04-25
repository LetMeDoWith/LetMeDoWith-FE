import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import { FeedNagList, FeedNagEmpty, SuccessTaskImageList } from 'components/Feed';
import { useScheduledRefetch } from 'hooks/shared/useScheduledRefetch';
import { useFetchFeedbackAvailableDowithTasks } from 'hooks/queries/task/useFetchFeedbackAvailableDowithTasks';
import { TASK_QUERY_KEY } from 'constants/queries';

const Feed = () => {
  // 정시 기준 5분 간격(1분, 6분, ..., 56분)으로 피드 데이터 자동 refetch
  useScheduledRefetch([TASK_QUERY_KEY.FEEDBACK_AVAILABLE_DOWITH_TASKS, TASK_QUERY_KEY.SUCCESS_DOWITH_TASKS]);

  const queryClient = useQueryClient();
  const { data } = useFetchFeedbackAvailableDowithTasks();
  const hasNagTasks = (data?.dowithTasks.length ?? 0) > 0;

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY.FEEDBACK_AVAILABLE_DOWITH_TASKS }),
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY.SUCCESS_DOWITH_TASKS }),
    ]);
    setRefreshing(false);
  }, [queryClient]);

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {hasNagTasks ? (
        <>
          <FeedNagList />
          <SuccessTaskImageList />
        </>
      ) : (
        <FeedNagEmpty />
      )}
    </ScrollView>
  );
};

export { Feed };
