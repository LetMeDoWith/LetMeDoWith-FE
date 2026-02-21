import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { BlueCamera } from 'components/common/icons/BlueCamera';
import { SuccessTaskImageCard } from 'components/Feed';
import { theme } from 'styles/theme';
import { SUCCESS_TASK_IMAGE_ITEM_GAP, SUCCESS_TASK_IMAGE_ITEM_WIDTH } from 'constants/Feed';

const ItemSeparator = () => <View style={{ width: SUCCESS_TASK_IMAGE_ITEM_GAP }} />;
const renderItem = ({ item }: { item: (typeof MOCK_SUCCESS_IMAGES)[number] }) => <SuccessTaskImageCard {...item} />;

// TODO: 인증 사진 리스트 API 연동
const MOCK_SUCCESS_IMAGES = [
  {
    successImageUrl: 'https://picsum.photos/seed/run/400/400',
    title: '아침 5km 러닝 완료',
    profileImageUrl: 'https://picsum.photos/seed/user1/100/100',
    userName: '달리는사람',
  },
  {
    successImageUrl: 'https://picsum.photos/seed/book/400/400',
    title: '독서 30분 달성',
    profileImageUrl: 'https://picsum.photos/seed/user2/100/100',
    userName: '책벌레',
  },
  {
    successImageUrl: 'https://picsum.photos/seed/gym/400/400',
    title: '헬스장 루틴 완료',
    profileImageUrl: 'https://picsum.photos/seed/user3/100/100',
    userName: '근육맨',
  },
  {
    successImageUrl: 'https://picsum.photos/seed/cook/400/400',
    title: '도시락 직접 싸기 성공',
    profileImageUrl: 'https://picsum.photos/seed/user4/100/100',
    userName: '요리왕',
  },
  {
    successImageUrl: 'https://picsum.photos/seed/study/400/400',
    title: '알고리즘 문제 3개 풀기',
    profileImageUrl: 'https://picsum.photos/seed/user5/100/100',
    userName: '코딩마스터',
  },
  {
    successImageUrl: 'https://picsum.photos/seed/yoga/400/400',
    title: '아침 요가 스트레칭',
    profileImageUrl: 'https://picsum.photos/seed/user6/100/100',
    userName: '유연한몸',
  },
  {
    successImageUrl: 'https://picsum.photos/seed/clean/400/400',
    title: '방 청소 및 정리정돈',
    profileImageUrl: 'https://picsum.photos/seed/user7/100/100',
    userName: '깔끔대장',
  },
  {
    successImageUrl: 'https://picsum.photos/seed/water/400/400',
    title: '물 2L 마시기 달성',
    profileImageUrl: 'https://picsum.photos/seed/user8/100/100',
    userName: '수분충전',
  },
];

const SuccessTaskImageList = () => {
  return (
    <View style={styles.container}>
      <View style={styles.titleSection}>
        <BlueCamera />
        <Text style={theme.TYPOGRAPHY.TITLE_2}>갓생 완료! 인증 사진 모음</Text>
      </View>
      <FlatList
        data={MOCK_SUCCESS_IMAGES}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SUCCESS_TASK_IMAGE_ITEM_WIDTH + SUCCESS_TASK_IMAGE_ITEM_GAP}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={ItemSeparator}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    backgroundColor: theme.COLORS.SECONDARY.BLUE_97,
    gap: 24,
  },
  titleSection: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  listContent: {
    paddingHorizontal: 20,
  },
});

export { SuccessTaskImageList };
