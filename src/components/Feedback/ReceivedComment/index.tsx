import { StyleSheet, Text, View } from 'react-native';

import { ProfileImage } from 'components/common/ProfileImage';
import { theme } from 'styles/theme';
import { formatTimeAgo } from 'utils/date';

interface Props {
  profileImageUrl: string;
  message: string;
  nickname: string;
  dowithTaskTitle?: string;
  receivedAt: string;
  isLast?: boolean;
  /* 이미 확인한 잡도리. 알림 목록의 확인된 항목처럼 흐리게 보여 읽었음을 알린다. */
  isChecked?: boolean;
}

const ReceivedComment = ({
  profileImageUrl,
  message,
  nickname,
  dowithTaskTitle,
  receivedAt,
  isLast = false,
  isChecked = false,
}: Props) => {
  return (
    <View style={[styles.container, isLast && styles.noBorder, isChecked && styles.checked]}>
      <ProfileImage uri={profileImageUrl} size={40} style={styles.image} />
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
  /* 알림 목록의 확인된 항목(itemConfirmed)과 같은 값 */
  checked: {
    opacity: 0.4,
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
