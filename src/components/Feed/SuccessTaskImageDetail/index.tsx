import React, { useCallback } from 'react';
import { Dimensions, FlatList, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from 'styles/theme';
import { CancelIcon } from 'components/common/icons/CancelIcon';
import { LikeIcon } from 'components/common/icons/LikeIcon';

type SuccessImageItem = {
  successImageUrl: string;
  title: string;
  profileImageUrl: string;
  userName: string;
  likeCount: number;
};

interface Props {
  visible: boolean;
  data: SuccessImageItem[];
  initialIndex: number;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SuccessTaskImageDetail = ({ visible, data, initialIndex, onClose }: Props) => {
  const insets = useSafeAreaInsets();

  const renderPage = useCallback(
    ({ item }: { item: SuccessImageItem }) => (
      <View style={styles.page}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: item.successImageUrl }} style={styles.image} resizeMode="cover" />
        </View>
        <View style={styles.infoSection}>
          <Text style={[theme.TYPOGRAPHY.TITLE_1, { color: theme.COLORS.DEFAULT.WHITE }]} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.bottomRow}>
            <View style={styles.profileRow}>
              <Image source={{ uri: item.profileImageUrl }} style={styles.profileImage} />
              <Text style={styles.userName}>{item.userName}</Text>
            </View>
            <Pressable style={styles.likeButton}>
              <LikeIcon
                {...(item.likeCount > 0 && {
                  fill: theme.COLORS.STATUS.RED_55,
                  stroke: theme.COLORS.STATUS.RED_55,
                })}
              />
              {item.likeCount > 0 && (
                <Text style={[theme.TYPOGRAPHY.BODY_2, { color: theme.COLORS.DEFAULT.WHITE }]}>{item.likeCount}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    ),
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
          renderItem={renderPage}
          keyExtractor={(_, index) => index.toString()}
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
  page: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 0.75,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileImage: {
    width: 24,
    height: 24,
    borderRadius: 16,
  },
  userName: {
    color: theme.COLORS.GRAY_SCALE.GRAY_80,
    fontSize: 14,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

export { SuccessTaskImageDetail };
