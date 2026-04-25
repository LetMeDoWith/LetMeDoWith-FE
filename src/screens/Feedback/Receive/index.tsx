import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { ReceivedComment, EmptyComment } from 'components/Feedback';
import { useFetchReceivedFeedbacks } from 'hooks/queries/feedback/useFetchReceivedFeedbacks';
import type { receivedFeedbackSchemeType } from 'types/feedback/scheme/api';

const ReceiveFeedback = () => {
  const { data, isLoading } = useFetchReceivedFeedbacks();

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
      <View style={styles.container}>
        <EmptyComment type="RECEIVE" />
      </View>
    );
  }

  const renderItem = ({ item, index }: { item: receivedFeedbackSchemeType; index: number }) => (
    <ReceivedComment
      profileImageUrl={item.senderProfileImageUrl}
      message={item.taskFeedbackTemplate.message}
      nickname={item.senderNickname}
      dowithTaskTitle={item.dowithTaskTitle}
      receivedAt={item.receivedAt}
      isLast={index === feedbacks.length - 1}
    />
  );

  return (
    <FlatList
      data={feedbacks}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    gap: 20,
  },
});

export { ReceiveFeedback };
