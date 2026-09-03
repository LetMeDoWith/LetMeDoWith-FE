import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { runWithSuppressedOverlay } from 'stores/loadingOverlayStore';
import FastImage from 'react-native-fast-image';
import { Freeze } from 'react-freeze';

import { ProfileImage } from 'components/common/ProfileImage';
import { Thunder } from 'components/common/icons/Thunder';
import { LikeIcon } from 'components/common/icons/LikeIcon';
import { ReceivedFeedbackContent } from 'components/Feedback/ReceivedFeedbackContent';
import { TaskInfoHeader } from 'components/Feedback/TaskInfoHeader';
import { useFetchDowithTaskFeedbackAggregates } from 'hooks/queries/feedback/useFetchDowithTaskFeedbackAggregates';
import { useFetchDowithTask } from 'hooks/queries/task/useFetchDowithTask';
import { useFetchDowithTaskLikers } from 'hooks/queries/task/useFetchDowithTaskLikers';
import { TASK_STATUS_ENUM } from 'schemes/task/enum';
import { theme } from 'styles/theme';
import type { CheerCollectionTabType, RootStackScreenProps } from 'types/shared';
import type { dowithTaskLikerSchemeType } from 'types/task/scheme/api';

const CheerCollection = ({ route }: RootStackScreenProps<'CHEER_COLLECTION'>) => {
  const { successImageUrl: successImageUrlParam } = route.params;
  // 딥링크로 진입하면 dowithTaskId가 문자열로 전달될 수 있어 숫자로 보정
  const dowithTaskId = Number(route.params.dowithTaskId);
  /*
   * 공감 알림 딥링크(tab=like)로 들어오면 좋아요 탭을 연다.
   * 딥링크 값은 서버가 보내는 문자열이라 예상 밖 값이 올 수 있으므로 ?? 대신 화이트리스트로 비교한다.
   * ??를 쓰면 대문자 LIKE처럼 어긋난 값이 그대로 상태에 들어가 두 탭 모두 비활성인 화면이 된다.
   */
  const [activeTab, setActiveTab] = useState<CheerCollectionTabType>(route.params.tab === 'like' ? 'like' : 'feedback');

  /*
   * 사진은 Item 진입 시 params로 즉시 렌더하지만, 상태칩·제목은 params에 없어 상세 조회가 필요하다.
   * (같은 태스크를 목록에서 이미 열어봤다면 캐시가 쓰인다)
   */
  const { data: dowithTask } = useFetchDowithTask({ dowithTaskId });
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
          <ProfileImage uri={item.profileImageUrl} size={36} style={styles.likeImage} />
        ) : (
          <View style={styles.likeImage} />
        )}
        <Text style={styles.likeNickname}>{item.nickname}</Text>
      </View>
    ),
    [],
  );

  /*
   * 두 탭이 공유하는 부분. 상태칩·제목은 시안상 잡도리 탭에만 있어 아래에서 따로 끼운다.
   */
  const renderListHeader = (withTaskInfo: boolean) => (
    <>
      <FastImage
        source={{ uri: successImageUrl }}
        style={styles.successImage}
        resizeMode={FastImage.resizeMode.cover}
      />
      {withTaskInfo && (
        <TaskInfoHeader
          title={dowithTask?.title ?? ''}
          status={dowithTask?.status ?? TASK_STATUS_ENUM.enum.SUCCESS}
          layout="INLINE"
        />
      )}
      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tabButton, activeTab === 'feedback' && styles.tabButtonActive]}
          onPress={() => setActiveTab('feedback')}
        >
          <Thunder
            width={14}
            height={14}
            fill={activeTab === 'feedback' ? theme.COLORS.DEFAULT.WHITE : theme.COLORS.GRAY_SCALE.GRAY_40}
          />
          <Text style={[styles.tabButtonText, activeTab === 'feedback' && styles.tabButtonTextActive]}>
            잡도리 {feedbackCount}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, activeTab === 'like' && styles.tabButtonActive]}
          onPress={() => setActiveTab('like')}
        >
          <LikeIcon
            width={14}
            height={14}
            {...(activeTab === 'like'
              ? { fill: theme.COLORS.DEFAULT.WHITE, stroke: theme.COLORS.DEFAULT.WHITE }
              : { fill: theme.COLORS.GRAY_SCALE.GRAY_40, stroke: theme.COLORS.GRAY_SCALE.GRAY_40 })}
          />
          <Text style={[styles.tabButtonText, activeTab === 'like' && styles.tabButtonTextActive]}>
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
        style={[styles.tabContent, activeTab !== 'feedback' && styles.hiddenTab]}
        pointerEvents={activeTab === 'feedback' ? 'auto' : 'none'}
      >
        <Freeze freeze={activeTab !== 'feedback'}>
          <ReceivedFeedbackContent
            dowithTaskId={dowithTaskId}
            showTotalCount={false}
            headerComponent={renderListHeader(true)}
            contentContainerStyle={styles.listContent}
          />
        </Freeze>
      </View>
      <View
        style={[styles.tabContent, activeTab !== 'like' && styles.hiddenTab]}
        pointerEvents={activeTab === 'like' ? 'auto' : 'none'}
      >
        <Freeze freeze={activeTab !== 'like'}>
          <FlatList
            data={likers}
            renderItem={renderLikerItem}
            keyExtractor={item => item.dowithTaskLikeId.toString()}
            onEndReached={handleLikersEndReached}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={renderListHeader(false)}
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
