import { Image, StyleSheet, Text, View } from 'react-native';

import { theme } from 'styles/theme';

interface Props {
  profileImageUrl: string;
  message: string;
  nickname: string;
  isLast?: boolean;
}

const Comment = ({ profileImageUrl, message, nickname, isLast = false }: Props) => {
  return (
    <View style={[styles.container, isLast && styles.noBorder]}>
      <Image style={styles.image} source={{ uri: profileImageUrl }} />
      <View style={styles.content}>
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.nickname}>{nickname}님</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
    flexDirection: 'row',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.GRAY_SCALE.GRAY_92,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 40,
  },
  content: {
    flex: 1,
    gap: 8,
  },
  message: theme.TYPOGRAPHY.BODY_1,
  nickname: { ...theme.TYPOGRAPHY.CAPTION1_BASIC, color: theme.COLORS.GRAY_SCALE.GRAY_70 },
});

export { Comment };
