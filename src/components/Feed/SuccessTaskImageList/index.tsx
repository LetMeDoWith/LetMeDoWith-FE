import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { BlueCamera } from 'components/common/icons/BlueCamera';
import { SuccessTaskImageCard } from 'components/Feed';
import { theme } from 'styles/theme';
import { SUCCESS_TASK_IMAGE_ITEM_GAP, SUCCESS_TASK_IMAGE_ITEM_WIDTH } from 'constants/Feed';
import { useFetchSuccessDowithTasks } from 'hooks/queries/task/useFetchSuccessDowithTasks';
import { useSuccessTaskImageDetail } from 'hooks/shared/useSuccessTaskImageDetail';
import type { successDowithTaskSchemeType } from 'types/task/scheme/api';

const ItemSeparator = () => <View style={{ width: SUCCESS_TASK_IMAGE_ITEM_GAP }} />;

const SuccessTaskImageList = () => {
  const { data: successTasks = [] } = useFetchSuccessDowithTasks();
  const { openDetail, detailModal } = useSuccessTaskImageDetail(successTasks);

  const renderItem = useCallback(
    ({ item, index }: { item: successDowithTaskSchemeType; index: number }) => (
      <SuccessTaskImageCard {...item} onPress={() => openDetail(index)} />
    ),
    [openDetail],
  );

  return (
    <View style={styles.container}>
      <View style={styles.titleSection}>
        <BlueCamera />
        <Text style={theme.TYPOGRAPHY.TITLE_2}>갓생 완료! 인증 사진 모음</Text>
      </View>
      <FlatList
        data={successTasks}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SUCCESS_TASK_IMAGE_ITEM_WIDTH + SUCCESS_TASK_IMAGE_ITEM_GAP}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={ItemSeparator}
        renderItem={renderItem}
        keyExtractor={({ id }) => id.toString()}
      />
      {detailModal}
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
