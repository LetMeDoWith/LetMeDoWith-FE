import { type ComponentType, type ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, type FlatListProps, Pressable, StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import { Thunder } from 'components/common/icons/Thunder';
import { useFetchDowithTaskFeedbackAggregates } from 'hooks/queries/feedback/useFetchDowithTaskFeedbackAggregates';
import { useFetchDowithTaskFeedbacks } from 'hooks/queries/feedback/useFetchDowithTaskFeedbacks';
import { useFetchFeedbackTemplates } from 'hooks/queries/feedback/useFetchFeedbackTemplates';
import { theme } from 'styles/theme';
import type { dowithTaskFeedbackSchemeType } from 'types/feedback/scheme/api';

interface Props {
  dowithTaskId: number;
  enabled?: boolean;
  showTotalCount?: boolean;
  ListComponent?: ComponentType<FlatListProps<dowithTaskFeedbackSchemeType>>;
  headerComponent?: ReactElement;
}

const ReceivedFeedbackContent = ({
  dowithTaskId,
  enabled = true,
  showTotalCount = true,
  ListComponent = FlatList,
  headerComponent,
}: Props) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

  const { data: aggregates } = useFetchDowithTaskFeedbackAggregates(dowithTaskId, enabled);
  const { data: templates } = useFetchFeedbackTemplates();
  const {
    data: feedbackPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchDowithTaskFeedbacks(dowithTaskId, selectedTemplateId);

  const templateMap = useMemo(() => {
    const map = new Map<number, { emojiUrl: string; name: string }>();
    templates?.forEach(t => map.set(t.id, { emojiUrl: t.emojiUrl, name: t.name }));
    return map;
  }, [templates]);

  const totalCount = aggregates?.reduce((sum, item) => sum + item.count, 0) ?? 0;

  const feedbacks = useMemo(() => feedbackPages?.pages.flatMap(page => page.data.feedbacks) ?? [], [feedbackPages]);

  useEffect(() => {
    if (aggregates && aggregates.length > 0 && selectedTemplateId === null) {
      setSelectedTemplateId(aggregates[0].feedbackTemplateId);
    }
  }, [aggregates, selectedTemplateId]);

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: dowithTaskFeedbackSchemeType }) => (
      <View style={styles.senderRow}>
        {item.senderProfileImageUrl ? (
          <FastImage source={{ uri: item.senderProfileImageUrl }} style={styles.senderImage} />
        ) : (
          <View style={styles.senderImage} />
        )}
        <Text style={styles.senderNickname}>{item.senderNickname}</Text>
      </View>
    ),
    [],
  );

  const selectedTemplateName = selectedTemplateId ? templateMap.get(selectedTemplateId)?.name : '';

  const ListHeader = (
    <View>
      {headerComponent}
      {showTotalCount && (
        <View style={styles.totalCountRow}>
          <Thunder width={14} height={14} fill={theme.COLORS.GRAY_SCALE.GRAY_40} />
          <Text style={styles.totalCountText}>총 {totalCount.toLocaleString('ko-KR')}개</Text>
        </View>
      )}
      <View style={styles.tabContainer}>
        {aggregates?.map(item => {
          const template = templateMap.get(item.feedbackTemplateId);
          const isSelected = selectedTemplateId === item.feedbackTemplateId;
          return (
            <Pressable
              key={item.feedbackTemplateId}
              style={[styles.tab, isSelected && styles.tabSelected]}
              onPress={() => setSelectedTemplateId(item.feedbackTemplateId)}
            >
              {template?.emojiUrl && <FastImage source={{ uri: template.emojiUrl }} style={styles.tabEmoji} />}
              <Text style={[styles.tabCount, isSelected && styles.tabCountSelected]}>{item.count}</Text>
            </Pressable>
          );
        })}
      </View>
      {selectedTemplateName && (
        <View style={styles.selectedTemplateWrapper}>
          <View style={styles.selectedTemplateArrow} />
          <View style={styles.selectedTemplateRow}>
            <Text style={styles.selectedTemplateName}>{selectedTemplateName}</Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <ListComponent
      data={feedbacks}
      renderItem={renderItem}
      keyExtractor={(item: dowithTaskFeedbackSchemeType) => item.id.toString()}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeader}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  totalCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 20,
    marginBottom: 8,
  },
  totalCountText: {
    ...theme.TYPOGRAPHY.BODY_2,
    color: theme.COLORS.GRAY_SCALE.GRAY_50,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_92,
  },
  tabSelected: {
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_40,
  },
  tabEmoji: {
    width: 44,
    height: 44,
  },
  tabCount: {
    ...theme.TYPOGRAPHY.BODY_2,
    color: theme.COLORS.GRAY_SCALE.GRAY_50,
    marginTop: 4,
  },
  tabCountSelected: {
    color: theme.COLORS.GRAY_SCALE.GRAY_20,
  },
  selectedTemplateWrapper: {
    alignItems: 'center',
    marginTop: 8,
  },
  selectedTemplateArrow: {
    width: 14,
    height: 10,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_96,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    transform: [{ rotate: '45deg' }],
    marginBottom: -5,
  },
  selectedTemplateRow: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_96,
    borderRadius: 12,
  },
  selectedTemplateName: {
    ...theme.TYPOGRAPHY.TITLE_3,
  },
  listContent: {
    paddingBottom: 20,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  senderImage: {
    width: 36,
    height: 36,
    borderRadius: 20,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_92,
  },
  senderNickname: {
    ...theme.TYPOGRAPHY.BODY_2,
  },
});

export { ReceivedFeedbackContent };
