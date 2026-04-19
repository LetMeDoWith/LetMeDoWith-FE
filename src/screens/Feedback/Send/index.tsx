import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { Comment, EmptyComment } from 'components/Feedback';
import { useFetchSendFeedbacks } from 'hooks/queries/feedback/useFetchSendFeedbacks';
import type { sendFeedbackSchemeType } from 'types/feedback/scheme/api';

const SendFeedback = () => {
  const { data, isLoading } = useFetchSendFeedbacks();

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
        <EmptyComment />
      </View>
    );
  }

  const renderItem = ({ item, index }: { item: sendFeedbackSchemeType; index: number }) => (
    <Comment
      profileImageUrl={item.senderProfileImageUrl}
      message={item.taskFeedbackTemplate.message}
      nickname={item.senderNickname}
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

export { SendFeedback };
