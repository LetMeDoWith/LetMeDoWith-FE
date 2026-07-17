import { useCallback, useRef } from 'react';
import { Dimensions, type NativeScrollEvent, type NativeSyntheticEvent, ScrollView } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

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

  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const tabBarHeight = useBottomTabBarHeight();

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.current = event.nativeEvent.contentOffset.y;
  }, []);

  // 이모지 바 하단(window 기준 Y)이 탭바 위 보이는 영역을 넘으면(가려지면) 그만큼 스크롤해 다 보이게 한다.
  const handleItemExpand = useCallback(
    (reactionBarBottomY: number) => {
      const visibleBottom = Dimensions.get('window').height - tabBarHeight;
      const REVEAL_MARGIN = 16;
      const overflow = reactionBarBottomY - visibleBottom + REVEAL_MARGIN;

      if (overflow > 0) {
        scrollRef.current?.scrollTo({ y: scrollY.current + overflow, animated: true });
      }
    },
    [tabBarHeight],
  );

  const onRefresh = useCallback(
    () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY.FEEDBACK_AVAILABLE_DOWITH_TASKS }),
        queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY.SUCCESS_DOWITH_TASKS }),
      ]),
    [queryClient],
  );

  return (
    <ScrollView
      ref={scrollRef}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      refreshControl={<PullToRefreshControl onRefresh={onRefresh} />}
    >
      {!isLoading && hasNagTasks && (
        <>
          <FeedNagList onItemExpand={handleItemExpand} />
          <SuccessTaskImageList />
        </>
      )}
      {!isLoading && !hasNagTasks && <FeedNagEmpty />}
    </ScrollView>
  );
};

export { Feed };
