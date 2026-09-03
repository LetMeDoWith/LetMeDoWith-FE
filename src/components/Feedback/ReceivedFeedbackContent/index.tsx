import { type ComponentType, type ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  type FlatListProps,
  Pressable,
  StyleSheet,
  type StyleProp,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import FastImage from 'react-native-fast-image';

import { runWithSuppressedOverlay } from 'stores/loadingOverlayStore';

import { Thunder } from 'components/common/icons/Thunder';
import { FeedbackEmoji } from 'components/Feedback/FeedbackEmoji';
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
  /*
   * 받은 잡도리가 하나도 없을 때 목록 자리에 채울 내용.
   * 빈 상태에서 무엇을 유도할지는 화면마다 다르므로 밖에서 주입받는다.
   */
  emptyComponent?: ReactElement;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

const ReceivedFeedbackContent = ({
  dowithTaskId,
  enabled = true,
  showTotalCount = true,
  ListComponent = FlatList,
  headerComponent,
  emptyComponent,
  contentContainerStyle,
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
    const map = new Map<number, { emojiUrl: string; nameTokens: string[] }>();
    templates?.forEach(t => map.set(t.id, { emojiUrl: t.emojiUrl, nameTokens: t.nameTokens }));
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
      runWithSuppressedOverlay(() => fetchNextPage());
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

  // 잔소리 선택 UI가 아닌 화면(잡도리 모아보기 등)에서는 공백으로 결합
  const selectedTemplateName = selectedTemplateId ? templateMap.get(selectedTemplateId)?.nameTokens.join(' ') : '';

  const ListHeader = (
    <View>
      {headerComponent}
      {/* headerComponent와 형제로 감싸, 절대 위치 기준(top:0)이 구분선 바로 아래가 되게 한다 */}
      <View>
        {showTotalCount && (
          <View style={[styles.totalCountRow, emptyComponent && styles.totalCountRowAbsolute]}>
            <Thunder width={14} height={14} fill={theme.COLORS.GRAY_SCALE.GRAY_40} />
            <Text style={styles.totalCountText}>잡도리 {totalCount.toLocaleString('ko-KR')}</Text>
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
                {template?.emojiUrl && <FeedbackEmoji uri={template.emojiUrl} size={44} />}
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
      ListEmptyComponent={emptyComponent}
      style={emptyComponent && styles.filledList}
      contentContainerStyle={[styles.listContent, emptyComponent && styles.filledListContent, contentContainerStyle]}
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
  totalCountRowAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  totalCountText: {
    ...theme.TYPOGRAPHY.BODY_2,
    color: theme.COLORS.GRAY_SCALE.GRAY_20,
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
  filledList: {
    flex: 1,
  },
  filledListContent: {
    flexGrow: 1,
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
