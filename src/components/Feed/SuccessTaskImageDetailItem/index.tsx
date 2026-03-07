import React, { useState } from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';

import { theme } from 'styles/theme';
import { LikeIcon } from 'components/common/icons/LikeIcon';
import type { successDowithTaskSchemeType } from 'types/task/scheme/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SuccessTaskImageDetailItem = ({
  successImageUrl,
  title,
  profileImageUrl,
  nickname,
  isLiked: initialIsLiked,
  likeCount,
}: successDowithTaskSchemeType) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const scale = useSharedValue(1);
  const displayCount = likeCount + (isLiked && !initialIsLiked ? 1 : !isLiked && initialIsLiked ? -1 : 0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleLike = () => {
    if (!isLiked) {
      scale.value = withSequence(withTiming(1.4, { duration: 150 }), withTiming(1, { duration: 150 }));
    }
    setIsLiked(prev => !prev);
  };

  return (
    <View style={styles.page}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: successImageUrl }} style={styles.image} resizeMode="cover" />
      </View>
      <View style={styles.infoSection}>
        <Text style={[theme.TYPOGRAPHY.TITLE_1, { color: theme.COLORS.DEFAULT.WHITE }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.bottomRow}>
          <View style={styles.profileRow}>
            <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
            <Text style={styles.userName}>{nickname}</Text>
          </View>
          <Pressable style={styles.likeButton} onPress={handleLike}>
            <Animated.View style={animatedStyle}>
              <LikeIcon {...(isLiked && { fill: theme.COLORS.STATUS.RED_55, stroke: theme.COLORS.STATUS.RED_55 })} />
            </Animated.View>
            {displayCount > 0 && (
              <Text style={[theme.TYPOGRAPHY.BODY_2, { color: theme.COLORS.DEFAULT.WHITE }]}>{displayCount}</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
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

export { SuccessTaskImageDetailItem };
