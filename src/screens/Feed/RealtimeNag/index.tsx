import { useCallback, useRef } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { runWithSuppressedOverlay } from 'stores/loadingOverlayStore';

import { FeedNagItem } from 'components/Feed/FeedNagItem';
import { FeedNagEmpty } from 'components/Feed/FeedNagEmpty';
import { useFetchFeedbackAvailableDowithTasksInfinite } from 'hooks/queries/task/useFetchFeedbackAvailableDowithTasksInfinite';
import type { feedbackAvailableDowithTaskSchemeType } from 'types/task/scheme/api';

const RealtimeNag = () => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFetchFeedbackAvailableDowithTasksInfinite();

  const dowithTasks = data?.pages.flatMap(page => page.data.dowithTasks) ?? [];

  const listRef = useRef<FlatList<feedbackAvailableDowithTaskSchemeType>>(null);

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      runWithSuppressedOverlay(() => fetchNextPage());
    }
  };

  /*
   * 잔소리 이모지가 펼쳐지면 해당 항목 하단을 뷰포트 하단에 맞춰(viewPosition:1) 이모지가 가려지지 않게 한다.
   * 레이아웃이 반영된 뒤 스크롤하도록 rAF로 한 프레임 지연.
   */
  const handleItemExpand = useCallback((index: number) => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index, viewPosition: 1, animated: true });
    });
  }, []);

  const renderItem = ({ item, index }: { item: feedbackAvailableDowithTaskSchemeType; index: number }) => (
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
      onExpand={() => handleItemExpand(index)}
    />
  );

  if (isLoading) {
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
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      // 펼침 직후 프레임 미측정 등으로 실패 시 대략 위치로 재시도(뷰포트 내 항목이라 대부분 성공)
      onScrollToIndexFailed={({ index }) => {
        setTimeout(() => listRef.current?.scrollToIndex({ index, viewPosition: 1, animated: true }), 100);
      }}
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
