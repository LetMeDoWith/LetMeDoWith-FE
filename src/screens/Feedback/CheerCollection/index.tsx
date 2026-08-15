import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { runWithSuppressedOverlay } from 'stores/loadingOverlayStore';
import FastImage from 'react-native-fast-image';
import { Freeze } from 'react-freeze';

import { Thunder } from 'components/common/icons/Thunder';
import { LikeIcon } from 'components/common/icons/LikeIcon';
import { ReceivedFeedbackContent } from 'components/Feedback/ReceivedFeedbackContent';
import { useFetchDowithTaskFeedbackAggregates } from 'hooks/queries/feedback/useFetchDowithTaskFeedbackAggregates';
import { useFetchDowithTask } from 'hooks/queries/task/useFetchDowithTask';
import { useFetchDowithTaskLikers } from 'hooks/queries/task/useFetchDowithTaskLikers';
import { theme } from 'styles/theme';
import type { RootStackScreenProps } from 'types/shared';
import type { dowithTaskLikerSchemeType } from 'types/task/scheme/api';

type Tab = 'FEEDBACK' | 'LIKE';

const CheerCollection = ({ route }: RootStackScreenProps<'CHEER_COLLECTION'>) => {
  const { successImageUrl: successImageUrlParam } = route.params;
  // 딥링크로 진입하면 dowithTaskId가 문자열로 전달될 수 있어 숫자로 보정
  const dowithTaskId = Number(route.params.dowithTaskId);
  const [activeTab, setActiveTab] = useState<Tab>('FEEDBACK');

  // Item 진입 시에는 params로 받은 이미지로 즉시 렌더, 딥링크 진입 시에는 상세 조회로 보완
  const { data: dowithTask } = useFetchDowithTask({ dowithTaskId }, { enabled: !successImageUrlParam });
  const successImageUrl = successImageUrlParam ?? dowithTask?.successImageUrls?.[0] ?? '';

  const { data: aggregates } = useFetchDowithTaskFeedbackAggregates(dowithTaskId);
  // 좋아요 카운트(totalCount)가 첫 페이지 응답에 담겨 있어, 진입 시점에도 개수를 표시하려면 쿼리를 항상 활성화한다.
  // (탭 활성 시에만 enable하면 좋아요 탭을 눌러야 카운트가 0→실제값으로 바뀌는 문제 발생)
  const { data: likersPages, fetchNextPage, hasNextPage, isFetchingNextPage } = useFetchDowithTaskLikers(dowithTaskId);

  const feedbackCount = aggregates?.reduce((sum, item) => sum + item.count, 0) ?? 0;
  const likeCount = likersPages?.pages[0]?.totalCount ?? 0;

  const likers = useMemo(() => likersPages?.pages.flatMap(page => page.data.likers) ?? [], [likersPages]);

  const handleLikersEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      runWithSuppressedOverlay(() => fetchNextPage());
    }
  };

  const renderLikerItem = useCallback(
    ({ item }: { item: dowithTaskLikerSchemeType }) => (
      <View style={styles.likeRow}>
        {item.profileImageUrl ? (
          <FastImage source={{ uri: item.profileImageUrl }} style={styles.likeImage} />
        ) : (
          <View style={styles.likeImage} />
        )}
        <Text style={styles.likeNickname}>{item.nickname}</Text>
      </View>
    ),
    [],
  );

  const listHeader = (
    <>
      <FastImage
        source={{ uri: successImageUrl }}
        style={styles.successImage}
        resizeMode={FastImage.resizeMode.cover}
      />
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
    </>
  );

  return (
    <View style={styles.container}>
      {/*
       * 비활성 탭을 display:none으로 숨기면, 다시 보일 때 네이티브 ScrollView가 레이아웃을
       * 재측정하면서 스크롤 위치가 0으로 리셋됐다가 복원되어 "위로 갔다 아래로" 플리커가 발생한다.
       * 절대배치로 겹쳐 두고 opacity/pointerEvents로만 숨겨 두 탭의 레이아웃(스크롤 위치)을 유지하고,
       * 비활성 탭은 Freeze로 감싸 마운트(스크롤 위치)는 유지하되 리렌더는 정지시켜 오버헤드를 줄인다.
       */}
      <View
        style={[styles.tabContent, activeTab !== 'FEEDBACK' && styles.hiddenTab]}
        pointerEvents={activeTab === 'FEEDBACK' ? 'auto' : 'none'}
      >
        <Freeze freeze={activeTab !== 'FEEDBACK'}>
          <ReceivedFeedbackContent
            dowithTaskId={dowithTaskId}
            showTotalCount={false}
            headerComponent={listHeader}
            contentContainerStyle={styles.listContent}
          />
        </Freeze>
      </View>
      <View
        style={[styles.tabContent, activeTab !== 'LIKE' && styles.hiddenTab]}
        pointerEvents={activeTab === 'LIKE' ? 'auto' : 'none'}
      >
        <Freeze freeze={activeTab !== 'LIKE'}>
          <FlatList
            data={likers}
            renderItem={renderLikerItem}
            keyExtractor={item => item.dowithTaskLikeId.toString()}
            onEndReached={handleLikersEndReached}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={listHeader}
            contentContainerStyle={styles.listContent}
          />
        </Freeze>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
  },
  tabContent: {
    ...StyleSheet.absoluteFillObject,
  },
  hiddenTab: {
    opacity: 0,
    zIndex: -1,
  },
  successImage: {
    aspectRatio: 0.75,
    marginHorizontal: -20,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    marginBottom: 20,
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
    paddingHorizontal: 20,
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

export { CheerCollection };
