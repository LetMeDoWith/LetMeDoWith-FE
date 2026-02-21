import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { theme } from 'styles/theme';
import { SUCCESS_TASK_IMAGE_ITEM_WIDTH } from 'constants/Feed';

const ITEM_HEIGHT = SUCCESS_TASK_IMAGE_ITEM_WIDTH * 1.3;

// TODO: 인증 사진 리스트 API 타입 연동
interface Props {
  successImageUrl: string;
  title: string;
  profileImageUrl: string;
  userName: string;
}

const SuccessTaskImageCard = ({ successImageUrl, title, profileImageUrl, userName }: Props) => (
  <View style={styles.card}>
    <Image source={{ uri: successImageUrl }} style={styles.successImage} />
    <LinearGradient colors={['transparent', 'rgba(0, 0, 0, 0.8)']} style={styles.overlay}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.profileRow}>
        <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
        <Text style={[theme.TYPOGRAPHY.CAPTION_2, { color: theme.COLORS.GRAY_SCALE.GRAY_70 }]}>{userName}</Text>
      </View>
    </LinearGradient>
  </View>
);

const styles = StyleSheet.create({
  card: {
    width: SUCCESS_TASK_IMAGE_ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
  },
  successImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  profileRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profileImage: {
    width: 24,
    height: 24,
    borderRadius: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export { SuccessTaskImageCard };
