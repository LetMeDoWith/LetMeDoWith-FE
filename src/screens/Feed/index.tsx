import { useCallback, useRef, useState } from 'react';
import { Dimensions, type NativeScrollEvent, type NativeSyntheticEvent, ScrollView } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';

import { FeedNagList, FeedNagEmpty, SuccessTaskImageList } from 'components/Feed';
import { PullToRefreshControl } from 'components/common/PullToRefreshControl';
import { useScheduledRefetch } from 'hooks/shared/useScheduledRefetch';
import { useFetchFeedbackAvailableDowithTasksInfinite } from 'hooks/queries/task/useFetchFeedbackAvailableDowithTasksInfinite';
import { TASK_QUERY_KEY } from 'constants/queries';
import { getRevealScrollOffset } from 'utils/scroll';
import { logEvent, resetDoriImpressions } from 'utils/analytics';

const Feed = () => {
  // 정시 기준 5분 간격(1분, 6분, ..., 56분)으로 피드 데이터 자동 refetch
  useScheduledRefetch([TASK_QUERY_KEY.FEEDBACK_AVAILABLE_DOWITH_TASKS, TASK_QUERY_KEY.SUCCESS_DOWITH_TASKS]);

  /*
   * 탭 화면은 blur돼도 unmount되지 않아 카드(FeedNagItem)의 마운트 시점 effect로는
   * 재방문 노출을 다시 셀 수 없다. 방문마다 증가하는 토큰을 내려보내 재발송을 트리거한다.
   * undefined는 "추적 안 함" — blur 상태에서 5분 주기 refetch로 새 카드가 마운트돼도
   * 노출이 발송되지 않도록 blur 시 undefined로 되돌린다.
   */
  const [impressionVisitId, setImpressionVisitId] = useState<number | undefined>(undefined);

  /* 탭 복귀도 방문으로 집계한다 — focus마다 발송 */
  useFocusEffect(
    useCallback(() => {
      logEvent('browse_view');
      /* 방문 토큰을 올려 이미 마운트된 카드들이 이번 방문의 노출을 다시 보내게 한다 */
      setImpressionVisitId(prev => (prev ?? 0) + 1);
      return () => {
        resetDoriImpressions();
        setImpressionVisitId(undefined);
      };
    }, []),
  );

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
      const offset = getRevealScrollOffset({
        elementBottomY: reactionBarBottomY,
        visibleBottom: Dimensions.get('window').height - tabBarHeight,
        currentOffset: scrollY.current,
      });

      if (offset !== null) {
        scrollRef.current?.scrollTo({ y: offset, animated: true });
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

  /*
   * 빈 상태는 2열 그리드라 자체 FlatList로 스크롤한다.
   * ScrollView 안에 두면 같은 방향의 VirtualizedList가 중첩돼 가상화가 무력화된다.
   */
  if (!isLoading && !hasNagTasks) {
    return <FeedNagEmpty onRefresh={onRefresh} />;
  }

  return (
    <ScrollView
      ref={scrollRef}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      refreshControl={<PullToRefreshControl onRefresh={onRefresh} />}
    >
      {!isLoading && hasNagTasks && (
        <>
          <FeedNagList onItemExpand={handleItemExpand} impressionVisitId={impressionVisitId} />
          <SuccessTaskImageList />
        </>
      )}
    </ScrollView>
  );
};

export { Feed };
