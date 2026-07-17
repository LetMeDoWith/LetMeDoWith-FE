import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ReceivedComment, EmptyComment } from 'components/Feedback';
import { PullToRefreshControl } from 'components/common/PullToRefreshControl';
import { useFetchReceivedFeedbacks } from 'hooks/queries/feedback/useFetchReceivedFeedbacks';
import type { receivedFeedbackSchemeType } from 'types/feedback/scheme/api';
import { navigateByDeepLink } from 'utils/deepLink';

const ReceiveFeedback = () => {
  const { data, isLoading, refetch } = useFetchReceivedFeedbacks();

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
        <EmptyComment type="RECEIVE" />
      </ScrollView>
    );
  }

  // 잔소리 항목을 탭하면 해당 두윗이 등록된 홈 화면으로 이동 (deepLink 미제공 시 아무 동작 안 함)
  const renderItem = ({ item, index }: { item: receivedFeedbackSchemeType; index: number }) => (
    <Pressable disabled={!item.deepLink} onPress={() => navigateByDeepLink(item.deepLink)}>
      <ReceivedComment
        profileImageUrl={item.senderProfileImageUrl}
        message={item.parsedMessage}
        nickname={item.senderNickname}
        dowithTaskTitle={item.dowithTaskTitle}
        receivedAt={item.receivedAt}
        isLast={index === feedbacks.length - 1}
      />
    </Pressable>
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

export { ReceiveFeedback };
