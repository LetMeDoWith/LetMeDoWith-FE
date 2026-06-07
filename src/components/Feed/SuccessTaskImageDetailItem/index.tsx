import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';

import { theme } from 'styles/theme';
import { LikeIcon } from 'components/common/icons/LikeIcon';
import { useLikeDowithTask } from 'hooks/queries/task/useLikeDowithTask';
import { useUnLikeDowithTask } from 'hooks/queries/task/useUnLikeDowithTask';
import { throttle } from 'utils/timing';
import type { successDowithTaskSchemeType } from 'types/task/scheme/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SuccessTaskImageDetailItem = ({
  id,
  successImageUrl,
  title,
  profileImageUrl,
  nickname,
  isLiked,
  likeCount,
}: successDowithTaskSchemeType) => {
  const scale = useSharedValue(1);
  const { mutate: likeDowithTask } = useLikeDowithTask();
  const { mutate: unLikeDowithTask } = useUnLikeDowithTask();

  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);
  const localIsLikedRef = useRef(localIsLiked);
  localIsLikedRef.current = localIsLiked;

  useEffect(() => {
    setLocalIsLiked(isLiked);
    setLocalLikeCount(likeCount);
  }, [isLiked, likeCount]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleLike = useMemo(
    () =>
      throttle(() => {
        if (localIsLikedRef.current) {
          setLocalIsLiked(false);
          setLocalLikeCount(prev => Math.max(0, prev - 1));
          localIsLikedRef.current = false;
          unLikeDowithTask(id, {
            onError: () => {
              setLocalIsLiked(true);
              setLocalLikeCount(prev => prev + 1);
              localIsLikedRef.current = true;
            },
          });
        } else {
          scale.value = withSequence(withTiming(1.4, { duration: 150 }), withTiming(1, { duration: 150 }));
          setLocalIsLiked(true);
          setLocalLikeCount(prev => prev + 1);
          localIsLikedRef.current = true;
          likeDowithTask(id, {
            onError: () => {
              setLocalIsLiked(false);
              setLocalLikeCount(prev => Math.max(0, prev - 1));
              localIsLikedRef.current = false;
            },
          });
        }
      }, 500),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  );

  return (
    <View style={styles.page}>
      <View style={styles.imageWrapper}>
        <FastImage source={{ uri: successImageUrl }} style={styles.image} resizeMode={FastImage.resizeMode.cover} />
      </View>
      <View style={styles.infoSection}>
        <Text style={[theme.TYPOGRAPHY.TITLE_1, { color: theme.COLORS.DEFAULT.WHITE }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.bottomRow}>
          <View style={styles.profileRow}>
            <FastImage source={{ uri: profileImageUrl }} style={styles.profileImage} />
            <Text style={styles.userName}>{nickname}</Text>
          </View>
          <Pressable style={styles.likeButton} onPress={handleLike}>
            <Animated.View style={animatedStyle}>
              <LikeIcon
                {...(localIsLiked && { fill: theme.COLORS.STATUS.RED_55, stroke: theme.COLORS.STATUS.RED_55 })}
              />
            </Animated.View>
            {localLikeCount > 0 && (
              <Text style={[theme.TYPOGRAPHY.BODY_2, { color: theme.COLORS.DEFAULT.WHITE }]}>{localLikeCount}</Text>
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
