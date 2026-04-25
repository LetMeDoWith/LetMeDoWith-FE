import { Image, StyleSheet, Text, View } from 'react-native';

import { theme } from 'styles/theme';
import { formatTimeAgo } from 'utils/date';

interface Props {
  profileImageUrl: string;
  message: string;
  nickname: string;
  dowithTaskTitle?: string;
  receivedAt: string;
  isLast?: boolean;
}

const ReceivedComment = ({
  profileImageUrl,
  message,
  nickname,
  dowithTaskTitle,
  receivedAt,
  isLast = false,
}: Props) => {
  return (
    <View style={[styles.container, isLast && styles.noBorder]}>
      <Image style={styles.image} source={{ uri: profileImageUrl }} />
      <View style={styles.content}>
        <Text style={styles.message}>{message}</Text>
        {dowithTaskTitle && (
          <Text style={styles.taskTitle} numberOfLines={1}>
            {dowithTaskTitle}
          </Text>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.info}>{nickname}님</Text>
          <Text style={styles.info}>•</Text>
          <Text style={styles.info}>{formatTimeAgo(receivedAt)}</Text>
        </View>
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
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_92,
  },
  content: {
    flex: 1,
  },
  message: {
    ...theme.TYPOGRAPHY.BODY_1,
    marginBottom: 4,
  },
  taskTitle: {
    ...theme.TYPOGRAPHY.BODY_2,
    color: theme.COLORS.GRAY_SCALE.GRAY_40,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  info: {
    ...theme.TYPOGRAPHY.CAPTION1_BASIC,
    color: theme.COLORS.GRAY_SCALE.GRAY_70,
  },
});

export { ReceivedComment };
