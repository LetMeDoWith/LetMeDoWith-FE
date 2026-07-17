import { ActivityIndicator, FlatList, ScrollView, StyleSheet, View } from 'react-native';

import { SentComment, EmptyComment } from 'components/Feedback';
import { PullToRefreshControl } from 'components/common/PullToRefreshControl';
import { useFetchSendFeedbacks } from 'hooks/queries/feedback/useFetchSendFeedbacks';
import type { sentFeedbackSchemeType } from 'types/feedback/scheme/api';

const SendFeedback = () => {
  const { data, isLoading, refetch } = useFetchSendFeedbacks();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  const feedbacks = data?.feedbacks ?? [];

  if (feedbacks.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={styles.emptyContainer}
        refreshControl={<PullToRefreshControl onRefresh={refetch} />}
      >
        <EmptyComment type="SEND" />
      </ScrollView>
    );
  }

  const renderItem = ({ item, index }: { item: sentFeedbackSchemeType; index: number }) => (
    <SentComment
      profileImageUrl={item.receiverProfileImageUrl}
      message={item.parsedMessage}
      nickname={item.receiverNickname}
      dowithTaskTitle={item.dowithTaskTitle}
      dowithTaskStatus={item.dowithTaskStatus}
      isLast={index === feedbacks.length - 1}
    />
  );

  return (
    <FlatList
      data={feedbacks}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={styles.list}
      refreshControl={<PullToRefreshControl onRefresh={refetch} />}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  list: {
    gap: 20,
  },
});

export { SendFeedback };
