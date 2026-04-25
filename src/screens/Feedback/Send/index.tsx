import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { SentComment, EmptyComment } from 'components/Feedback';
import { useFetchSendFeedbacks } from 'hooks/queries/feedback/useFetchSendFeedbacks';
import type { sentFeedbackSchemeType } from 'types/feedback/scheme/api';

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
        <EmptyComment type="SEND" />
      </View>
    );
  }

  const renderItem = ({ item, index }: { item: sentFeedbackSchemeType; index: number }) => (
    <SentComment
      profileImageUrl={item.senderProfileImageUrl}
      message={item.taskFeedbackTemplate.message}
      nickname={item.senderNickname}
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
