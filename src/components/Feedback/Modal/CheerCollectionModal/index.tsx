import { useCallback, useMemo, useState } from 'react';
import { FlatList, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Thunder } from 'components/common/icons/Thunder';
import { LikeIcon } from 'components/common/icons/LikeIcon';
import { CancelIcon } from 'components/common/icons/CancelIcon';
import { ReceivedFeedbackContent } from 'components/Feedback/ReceivedFeedbackContent';
import { useFetchDowithTaskFeedbackAggregates } from 'hooks/queries/feedback/useFetchDowithTaskFeedbackAggregates';
import { useFetchDowithTaskLikers } from 'hooks/queries/task/useFetchDowithTaskLikers';
import { theme } from 'styles/theme';
import type { dowithTaskLikerSchemeType } from 'types/task/scheme/api';

type Tab = 'FEEDBACK' | 'LIKE';

interface Props {
  visible: boolean;
  dowithTaskId: number;
  successImageUrl: string;
  onClose: () => void;
}

const CheerCollectionModal = ({ visible, dowithTaskId, successImageUrl, onClose }: Props) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>('FEEDBACK');

  const { data: aggregates } = useFetchDowithTaskFeedbackAggregates(dowithTaskId, visible);
  const {
    data: likersPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchDowithTaskLikers(dowithTaskId, visible && activeTab === 'LIKE');

  const feedbackCount = aggregates?.reduce((sum, item) => sum + item.count, 0) ?? 0;
  const likeCount = likersPages?.pages[0]?.totalCount ?? 0;

  const likers = useMemo(() => likersPages?.pages.flatMap(page => page.data.likers) ?? [], [likersPages]);

  const handleLikersEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderLikerItem = useCallback(
    ({ item }: { item: dowithTaskLikerSchemeType }) => (
      <View style={styles.likeRow}>
        {item.profileImageUrl ? (
          <Image source={{ uri: item.profileImageUrl }} style={styles.likeImage} />
        ) : (
          <View style={styles.likeImage} />
        )}
        <Text style={styles.likeNickname}>{item.nickname}</Text>
      </View>
    ),
    [],
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>응원 모아보기</Text>
          <Pressable style={styles.closeButton} onPress={onClose} hitSlop={12}>
            <CancelIcon />
          </Pressable>
        </View>
        <Image source={{ uri: successImageUrl }} style={styles.successImage} resizeMode="cover" />
        <View style={styles.tabRow}>
          <Pressable
            style={[styles.tabButton, activeTab === 'FEEDBACK' && styles.tabButtonActive]}
            onPress={() => setActiveTab('FEEDBACK')}
          >
            <Thunder
              width={14}
              height={14}
              fill={activeTab === 'FEEDBACK' ? theme.COLORS.DEFAULT.WHITE : theme.COLORS.GRAY_SCALE.GRAY_40}
            />
            <Text style={[styles.tabButtonText, activeTab === 'FEEDBACK' && styles.tabButtonTextActive]}>
              잔소리 {feedbackCount}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tabButton, activeTab === 'LIKE' && styles.tabButtonActive]}
            onPress={() => setActiveTab('LIKE')}
          >
            <LikeIcon
              width={14}
              height={14}
              {...(activeTab === 'LIKE'
                ? { fill: theme.COLORS.DEFAULT.WHITE, stroke: theme.COLORS.DEFAULT.WHITE }
                : { fill: theme.COLORS.GRAY_SCALE.GRAY_40, stroke: theme.COLORS.GRAY_SCALE.GRAY_40 })}
            />
            <Text style={[styles.tabButtonText, activeTab === 'LIKE' && styles.tabButtonTextActive]}>
              좋아요 {likeCount}
            </Text>
          </Pressable>
        </View>
        <View style={[styles.tabContent, activeTab !== 'FEEDBACK' && styles.hidden]}>
          <ReceivedFeedbackContent dowithTaskId={dowithTaskId} enabled={visible} showTotalCount={false} />
        </View>
        <View style={[styles.tabContent, activeTab !== 'LIKE' && styles.hidden]}>
          <FlatList
            data={likers}
            renderItem={renderLikerItem}
            keyExtractor={item => item.dowithTaskLikeId.toString()}
            onEndReached={handleLikersEndReached}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  title: {
    ...theme.TYPOGRAPHY.TITLE_1,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
  },
  tabContent: {
    flex: 1,
    marginTop: 20,
  },
  hidden: {
    display: 'none',
  },
  successImage: {
    aspectRatio: 0.75,
    marginHorizontal: -20,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_92,
  },
  tabButtonActive: {
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_20,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_20,
  },
  tabButtonText: {
    ...theme.TYPOGRAPHY.BODY_2,
    color: theme.COLORS.GRAY_SCALE.GRAY_20,
  },
  tabButtonTextActive: {
    color: theme.COLORS.DEFAULT.WHITE,
  },
  listContent: {
    paddingBottom: 20,
  },
  likeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  likeImage: {
    width: 36,
    height: 36,
    borderRadius: 20,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_92,
  },
  likeNickname: {
    ...theme.TYPOGRAPHY.BODY_1,
  },
});

export { CheerCollectionModal };
