import { StyleSheet, Text, View } from 'react-native';

import { ProfileImage } from 'components/common/ProfileImage';
import { theme } from 'styles/theme';

type DowithTaskStatusType = 'WAIT' | 'SUCCESS' | 'FAIL';

interface Props {
  profileImageUrl: string;
  message: string;
  nickname: string;
  dowithTaskTitle?: string;
  dowithTaskStatus?: DowithTaskStatusType;
  isLast?: boolean;
}

const STATUS_CONFIG: Record<DowithTaskStatusType, { label: string; backgroundColor: string; color: string }> = {
  WAIT: { label: '달성 전', backgroundColor: theme.COLORS.PRIMARY.RED_92, color: theme.COLORS.PRIMARY.RED_60 },
  SUCCESS: { label: '달성', backgroundColor: theme.COLORS.SECONDARY.BLUE_95, color: theme.COLORS.SECONDARY.BLUE_50 },
  FAIL: { label: '미달성', backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_92, color: theme.COLORS.GRAY_SCALE.GRAY_50 },
};

const SentComment = ({
  profileImageUrl,
  message,
  nickname,
  dowithTaskTitle,
  dowithTaskStatus,
  isLast = false,
}: Props) => {
  const statusConfig = dowithTaskStatus ? STATUS_CONFIG[dowithTaskStatus] : null;

  return (
    <View style={[styles.container, isLast && styles.noBorder]}>
      <ProfileImage uri={profileImageUrl} size={40} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.nickname}>{nickname}님</Text>
        {(dowithTaskTitle || statusConfig) && (
          <View style={styles.statusRow}>
            {dowithTaskTitle && (
              <Text style={styles.taskTitle} numberOfLines={1}>
                {dowithTaskTitle}
              </Text>
            )}
            {statusConfig && (
              <View style={[styles.statusBadge, { backgroundColor: statusConfig.backgroundColor }]}>
                <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
              </View>
            )}
          </View>
        )}
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
    marginBottom: 12,
  },
  nickname: {
    ...theme.TYPOGRAPHY.CAPTION1_BASIC,
    color: theme.COLORS.GRAY_SCALE.GRAY_70,
    marginBottom: 5,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitle: {
    ...theme.TYPOGRAPHY.BODY_2,
    color: theme.COLORS.GRAY_SCALE.GRAY_20,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    ...theme.TYPOGRAPHY.CAPTION1_BASIC,
    color: theme.COLORS.GRAY_SCALE.GRAY_20,
  },
});

export { SentComment };
