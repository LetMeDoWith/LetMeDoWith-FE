import { useMemo, useState } from 'react';
import { FlatList, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Thunder } from 'components/common/icons/Thunder';
import { LikeIcon } from 'components/common/icons/LikeIcon';
import { CancelIcon } from 'components/common/icons/CancelIcon';
import { ReceivedFeedbackContent } from 'components/Feedback/ReceivedFeedbackContent';
import { useFetchSuccessDowithTasks } from 'hooks/queries/task/useFetchSuccessDowithTasks';
import { theme } from 'styles/theme';

type Tab = 'FEEDBACK' | 'LIKE';

interface Props {
  visible: boolean;
  dowithTaskId: number;
  successImageUrl: string;
  feedbackCount: number;
  likeCount: number;
  onClose: () => void;
}

const CheerCollectionModal = ({ visible, dowithTaskId, successImageUrl, feedbackCount, likeCount, onClose }: Props) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>('FEEDBACK');

  // TODO: 좋아요 목록 API 연동
  const { data: successTasks = [] } = useFetchSuccessDowithTasks();
  const likeUsers = useMemo(
    () => successTasks.filter(t => t.id === dowithTaskId).flatMap(() => []),
    [successTasks, dowithTaskId],
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
          <ReceivedFeedbackContent dowithTaskId={dowithTaskId} enabled={visible} />
        </View>
        {/* TODO: 좋아요 목록 API 연동 후 실제 데이터로 교체 */}
        <View style={[styles.tabContent, activeTab !== 'LIKE' && styles.hidden]}>
          <FlatList
            data={likeUsers}
            renderItem={({ item }) => (
              <View style={styles.likeRow}>
                <View style={styles.likeImage} />
                <Text style={styles.likeNickname}>{item}</Text>
              </View>
            )}
            keyExtractor={(_, index) => index.toString()}
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
