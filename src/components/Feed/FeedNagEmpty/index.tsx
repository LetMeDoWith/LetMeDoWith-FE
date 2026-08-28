import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';

import { ProfileImage } from 'components/common/ProfileImage';
import { useFetchSuccessDowithTasks } from 'hooks/queries/task/useFetchSuccessDowithTasks';
import { useSuccessTaskImageDetail } from 'hooks/shared/useSuccessTaskImageDetail';
import { theme } from 'styles/theme';
import type { successDowithTaskSchemeType } from 'types/task/scheme/api';

import nagCompleteImage from 'assets/images/nag_complete.png';
import sweatDropsImage from 'assets/images/sweat_drops.png';

const CARD_WIDTH = 135;
const CARD_HEIGHT = 180;
const CARD_GAP = 16;

const ROTATIONS = ['-3deg', '2deg', '-2deg', '3deg', '-1deg'];

const FeedNagEmpty = () => {
  const { data: successTasks = [] } = useFetchSuccessDowithTasks();
  const { openDetail, detailModal } = useSuccessTaskImageDetail(successTasks);

  const renderCard = ({ item, index }: { item: successDowithTaskSchemeType; index: number }) => (
    <Pressable style={[styles.cardWrapper, { marginRight: CARD_GAP }]} onPress={() => openDetail(index)}>
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

  return (
    <View style={styles.container}>
      <View style={styles.textSection}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>휴, 잔소리 완료</Text>
          <Image source={sweatDropsImage} style={styles.sweatDrops} />
        </View>
        <View style={styles.descriptionWrap}>
          <Text style={styles.description}>모든 두윗러를 격려했네요!</Text>
          <Text style={styles.description}>다음 두윗이 올 때 까지 구경해 보아요.</Text>
        </View>
      </View>
      <Image source={nagCompleteImage} style={styles.nagCompleteImage} />
      {successTasks.length > 0 && (
        <View style={styles.cardListWrapper}>
          <FlatList
            data={successTasks}
            renderItem={renderCard}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardList}
          />
        </View>
      )}
      {detailModal}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  textSection: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 40,
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
    marginTop: 32,
  },
  cardListWrapper: {
    marginVertical: 77,
  },
  cardList: {
    paddingHorizontal: 37,
  },
  cardWrapper: {
    width: CARD_WIDTH + 10,
    height: CARD_HEIGHT + 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
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
