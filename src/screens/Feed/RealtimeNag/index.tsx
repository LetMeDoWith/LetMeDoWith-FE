import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  InteractionManager,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { runWithSuppressedOverlay } from 'stores/loadingOverlayStore';

import { FeedNagItem } from 'components/Feed/FeedNagItem';
import { FeedNagEmpty } from 'components/Feed/FeedNagEmpty';
import { getRevealScrollOffset } from 'utils/scroll';
import { useFetchFeedbackAvailableDowithTasksInfinite } from 'hooks/queries/task/useFetchFeedbackAvailableDowithTasksInfinite';
import type { feedbackAvailableDowithTaskSchemeType } from 'types/task/scheme/api';

const RealtimeNag = () => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFetchFeedbackAvailableDowithTasksInfinite();

  const dowithTasks = data?.pages.flatMap(page => page.data.dowithTasks) ?? [];

  const listRef = useRef<FlatList<feedbackAvailableDowithTaskSchemeType>>(null);
  const scrollY = useRef(0);
  const insets = useSafeAreaInsets();

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.current = event.nativeEvent.contentOffset.y;
  }, []);

  // 무거운 리스트를 화면 전환 애니메이션이 끝난 뒤에 마운트해 전환을 매끄럽게 한다(전환 중엔 스피너).
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => setIsReady(true));
    return () => task.cancel();
  }, []);

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      runWithSuppressedOverlay(() => fetchNextPage());
    }
  };

  /*
   * 이모지 바가 화면 아래로 가려질 때만, 가려진 만큼 스크롤한다(둘러보기 화면과 동일한 방식).
   * 이전에는 항목 위치와 무관하게 뷰포트 하단에 정렬해(scrollToIndex viewPosition:1)
   * 이미 보이는 항목을 펼쳐도 목록이 위로 튀었다.
   * 이 화면은 탭 네비게이터 밖(루트 스택)이라 탭바가 없어 safe area만 뺀다.
   */
  const handleItemExpand = useCallback(
    (reactionBarBottomY: number) => {
      const offset = getRevealScrollOffset({
        elementBottomY: reactionBarBottomY,
        visibleBottom: Dimensions.get('window').height - insets.bottom,
        currentOffset: scrollY.current,
      });

      if (offset !== null) {
        listRef.current?.scrollToOffset({ offset, animated: true });
      }
    },
    [insets.bottom],
  );

  const renderItem = useCallback(
    ({ item }: { item: feedbackAvailableDowithTaskSchemeType }) => (
      <FeedNagItem
        taskId={item.id}
        profileImageUrl={item.profileImageUrl}
        nickname={item.nickname}
        title={item.title}
        date={item.date}
        startTime={item.startTime}
        status={item.status}
        feedbackCount={item.feedbackCount}
        myFeedbacks={item.myFeedbacks}
        onExpand={handleItemExpand}
      />
    ),
    [handleItemExpand],
  );

  if (isLoading || !isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  if (dowithTasks.length === 0) {
    return <FeedNagEmpty />;
  }

  return (
    <FlatList
      ref={listRef}
      data={dowithTasks}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={styles.list}
      // 각 항목(애니메이션·쿼리 훅 다수)이 무거워, 렌더 물량을 조절해 스크롤·전환 성능을 확보한다.
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={10}
      updateCellsBatchingPeriod={50}
      removeClippedSubviews
      onScroll={handleScroll}
      scrollEventThrottle={16}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={styles.footer} /> : null}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  footer: {
    paddingVertical: 16,
  },
});

export { RealtimeNag };
