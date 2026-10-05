import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { runWithSuppressedOverlay } from 'stores/loadingOverlayStore';

import { ReceivedComment, EmptyComment } from 'components/Feedback';
import { PullToRefreshControl } from 'components/common/PullToRefreshControl';
import { useFetchReceivedFeedbacks } from 'hooks/queries/feedback/useFetchReceivedFeedbacks';
import { useCheckFeedback } from 'hooks/queries/feedback/useCheckFeedback';
import type { receivedFeedbackSchemeType } from 'types/feedback/scheme/api';
import { navigateByDeepLink } from 'utils/deepLink';

const ReceiveFeedback = () => {
  const { data, isLoading, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useFetchReceivedFeedbacks();
  const { mutate: checkFeedback } = useCheckFeedback();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  const feedbacks = data?.pages.flatMap(page => page.data.feedbacks) ?? [];

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      runWithSuppressedOverlay(() => fetchNextPage());
    }
  };

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

  /*
   * 잡도리 항목을 탭하면 확인(읽음) 처리하고, 해당 도리가 등록된 홈 화면으로 이동한다.
   * 이동은 확인 응답을 기다리지 않는다. 확인이 실패하면 읽지 않은 채로 남아 다음 탭 때 다시 시도된다.
   */
  const handlePressItem = (item: receivedFeedbackSchemeType) => {
    if (!item.isChecked) {
      checkFeedback(item.id);
    }

    if (item.deepLink) {
      navigateByDeepLink(item.deepLink);
    }
  };

  const renderItem = ({ item, index }: { item: receivedFeedbackSchemeType; index: number }) => (
    <Pressable onPress={() => handlePressItem(item)}>
      <ReceivedComment
        profileImageUrl={item.senderProfileImageUrl}
        message={item.parsedMessage}
        nickname={item.senderNickname}
        dowithTaskTitle={item.dowithTaskTitle}
        receivedAt={item.receivedAt}
        isLast={index === feedbacks.length - 1}
        isChecked={item.isChecked}
      />
    </Pressable>
  );

  return (
    <FlatList
      data={feedbacks}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={styles.list}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={styles.footer} /> : null}
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
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  footer: {
    paddingVertical: 16,
  },
});

export { ReceiveFeedback };
