import React, { useCallback } from 'react';
import { Dimensions, FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from 'styles/theme';
import { CancelIcon } from 'components/common/icons/CancelIcon';
import { SuccessTaskImageDetailItem } from 'components/Feed';
import type { successDowithTaskSchemeType } from 'types/task/scheme/api';

interface Props {
  visible: boolean;
  data: successDowithTaskSchemeType[];
  initialIndex: number;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SuccessTaskImageDetail = ({ visible, data, initialIndex, onClose }: Props) => {
  const insets = useSafeAreaInsets();

  const renderItem = useCallback(
    ({ item }: { item: successDowithTaskSchemeType }) => <SuccessTaskImageDetailItem {...item} />,
    [],
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={12}>
            <CancelIcon fill={theme.COLORS.DEFAULT.WHITE} />
          </Pressable>
        </View>
        <FlatList
          data={data}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
          renderItem={renderItem}
          keyExtractor={({ id }) => id.toString()}
          style={styles.contentList}
          contentContainerStyle={styles.contentContainer}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.DEFAULT.BLACK,
  },
  contentList: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
  },
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 32,
  },
});

export { SuccessTaskImageDetail };
