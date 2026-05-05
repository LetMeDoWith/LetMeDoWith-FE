import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { FeedNagItem } from 'components/Feed/FeedNagItem';
import { FeedNagEmpty } from 'components/Feed/FeedNagEmpty';
import { useFetchFeedbackAvailableDowithTasksInfinite } from 'hooks/queries/task/useFetchFeedbackAvailableDowithTasksInfinite';
import type { feedbackAvailableDowithTaskSchemeType } from 'types/task/scheme/api';

const RealtimeNag = () => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFetchFeedbackAvailableDowithTasksInfinite();

  const dowithTasks = data?.pages.flatMap(page => page.data.dowithTasks) ?? [];

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderItem = ({ item }: { item: feedbackAvailableDowithTaskSchemeType }) => (
    <FeedNagItem
      taskId={item.id}
      badgeImageUrl={item.badgeImageUrl}
      nickname={item.nickname}
      title={item.title}
      date={item.date}
      startTime={item.startTime}
      status={item.status}
      feedbackCount={item.feedbackCount}
      myFeedbacks={item.myFeedbacks}
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
      data={dowithTasks}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={styles.list}
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
