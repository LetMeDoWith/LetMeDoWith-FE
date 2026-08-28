import React, { memo, useCallback } from 'react';
import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';

import { ProfileImage } from 'components/common/ProfileImage';
import { PullToRefreshControl } from 'components/common/PullToRefreshControl';
import { useFetchSuccessDowithTasks } from 'hooks/queries/task/useFetchSuccessDowithTasks';
import { useSuccessTaskImageDetail } from 'hooks/shared/useSuccessTaskImageDetail';
import { theme } from 'styles/theme';
import type { successDowithTaskSchemeType } from 'types/task/scheme/api';

import nagCompleteImage from 'assets/images/nag_complete.png';
import sweatDropsImage from 'assets/images/sweat_drops.png';

/* 2열 그리드. 카드 비율은 기존 135:180(3:4)을 유지한 채 폭만 화면에 맞춘다. */
const HORIZONTAL_PADDING = 20;
const COLUMN_GAP = 24;
const ROW_GAP = 24;
const CARD_WIDTH = (Dimensions.get('window').width - HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2;
const CARD_HEIGHT = (CARD_WIDTH * 4) / 3;

const ROTATIONS = ['-3deg', '2deg', '-2deg', '3deg', '-1deg'];

interface CardProps {
  item: successDowithTaskSchemeType;
  index: number;
  onPress: (index: number) => void;
}

const SuccessCard = memo(function SuccessCard({ item, index, onPress }: CardProps) {
  const handlePress = useCallback(() => onPress(index), [onPress, index]);

  return (
    <Pressable style={styles.cardWrapper} onPress={handlePress}>
      <View style={[styles.card, { transform: [{ rotate: ROTATIONS[index % ROTATIONS.length] }] }]}>
        <FastImage source={{ uri: item.successImageUrl }} style={styles.cardImage} />
        <LinearGradient colors={['transparent', 'rgba(0, 0, 0, 0.6)']} style={styles.cardOverlay}>
          <View style={styles.cardProfileRow}>
            <ProfileImage uri={item.profileImageUrl} size={28} style={styles.cardProfileImage} />
            <Text style={styles.cardNickname}>{item.nickname}</Text>
          </View>
        </LinearGradient>
      </View>
    </Pressable>
  );
});

const ListHeader = () => (
  <View style={styles.textSection}>
    <View style={styles.titleRow}>
      <Text style={styles.title}>휴, 잡도리 완료</Text>
      <Image source={sweatDropsImage} style={styles.sweatDrops} />
    </View>
    <View style={styles.descriptionWrap}>
      <Text style={styles.description}>모든 리스트에 잡도리했어요!</Text>
      <Text style={styles.description}>다음 리스트까지 구경해 보아요.</Text>
    </View>
  </View>
);

/*
 * 인증샷이 하나도 없으면 제목·설명만 남아 화면이 비어 보인다.
 * 시안은 카드가 있는 경우만 다루므로, 카드가 없을 때는 기존 일러스트로 자리를 채운다.
 */
const ListEmpty = () => <Image source={nagCompleteImage} style={styles.nagCompleteImage} />;

interface Props {
  /*
   * 빈 상태에서는 이 목록이 화면의 스크롤 컨테이너라, 당겨서 새로고침도 여기에 붙는다.
   * 실시간 잔소리하기 화면처럼 당겨서 새로고침이 없는 곳에서는 넘기지 않는다.
   */
  onRefresh?: () => Promise<unknown>;
}

const FeedNagEmpty = ({ onRefresh }: Props) => {
  const { data: successTasks = [] } = useFetchSuccessDowithTasks();
  const { openDetail, detailModal } = useSuccessTaskImageDetail(successTasks);

  const renderCard = useCallback(
    ({ item, index }: { item: successDowithTaskSchemeType; index: number }) => (
      <SuccessCard item={item} index={index} onPress={openDetail} />
    ),
    [openDetail],
  );

  return (
    <>
      <FlatList
        data={successTasks}
        renderItem={renderCard}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        refreshControl={onRefresh ? <PullToRefreshControl onRefresh={onRefresh} /> : undefined}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews
      />
      {detailModal}
    </>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 40,
  },
  columnWrapper: {
    gap: COLUMN_GAP,
    marginBottom: ROW_GAP,
  },
  textSection: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 40,
    paddingBottom: 32,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    ...theme.TYPOGRAPHY.HEADER,
  },
  sweatDrops: {
    width: 24,
    height: 24,
  },
  descriptionWrap: {
    alignItems: 'center',
    gap: 2,
  },
  description: {
    ...theme.TYPOGRAPHY.BODY_2,
    color: theme.COLORS.GRAY_SCALE.GRAY_50,
  },
  nagCompleteImage: {
    width: 137,
    height: 157,
    alignSelf: 'center',
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  cardProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardProfileImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_92,
  },
  cardNickname: {
    ...theme.TYPOGRAPHY.CAPTION1_BASIC,
    color: theme.COLORS.GRAY_SCALE.GRAY_70,
  },
});

export { FeedNagEmpty };
