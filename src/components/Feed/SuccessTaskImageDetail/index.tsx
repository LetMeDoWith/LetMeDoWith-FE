import React, { useCallback, useEffect } from 'react';
import { Dimensions, FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
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
const SWIPE_THRESHOLD = 200;

const SuccessTaskImageDetail = ({ visible, data, initialIndex, onClose }: Props) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = 0;
    }
  }, [visible, translateY]);

  const panGesture = Gesture.Pan()
    .activeOffsetY(10)
    .failOffsetX([-10, 10])
    .onUpdate(e => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd(e => {
      if (e.translationY > SWIPE_THRESHOLD) {
        runOnJS(onClose)();
      } else {
        translateY.value = withTiming(0, { duration: 200 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: 1 - translateY.value / 500,
  }));

  const renderItem = useCallback(
    ({ item }: { item: successDowithTaskSchemeType }) => <SuccessTaskImageDetailItem {...item} />,
    [],
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }, animatedStyle]}
        >
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
        </Animated.View>
      </GestureDetector>
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
