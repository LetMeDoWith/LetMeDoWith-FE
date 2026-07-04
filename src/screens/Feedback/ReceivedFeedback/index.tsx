import { StyleSheet, Text, View } from 'react-native';

import { ReceivedFeedbackContent } from 'components/Feedback/ReceivedFeedbackContent';
import { theme } from 'styles/theme';
import type { RootStackScreenProps } from 'types/shared';
import type { TaskStatusEnumType } from 'types/task/scheme/enum';

const STATUS_CONFIG: Partial<Record<TaskStatusEnumType, { label: string; backgroundColor: string; color: string }>> = {
  WAIT: {
    label: '진행 중',
    backgroundColor: theme.COLORS.STATUS.YELLOW_90,
    color: theme.COLORS.STATUS.YELLOW_20,
  },
  FAIL: {
    label: '실패',
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_96,
    color: theme.COLORS.GRAY_SCALE.GRAY_50,
  },
};

const TaskInfoHeader = ({ title, status }: { title: string; status: TaskStatusEnumType }) => {
  const config = STATUS_CONFIG[status];

  return (
    <>
      <View style={styles.taskInfo}>
        {config && (
          <View style={[styles.statusChip, { backgroundColor: config.backgroundColor }]}>
            <Text style={[styles.statusChipText, { color: config.color }]}>{config.label}</Text>
          </View>
        )}
        <View style={styles.titleRow}>
          <Text style={styles.quote}>“</Text>
          <Text style={styles.taskTitle}>{title}</Text>
          <Text style={styles.quote}>”</Text>
        </View>
      </View>
      <View style={styles.sectionDivider} />
    </>
  );
};

const ReceivedFeedback = ({ route }: RootStackScreenProps<'RECEIVED_FEEDBACK'>) => {
  const { dowithTaskId, title, status } = route.params;

  return (
    <View style={styles.container}>
      <ReceivedFeedbackContent
        dowithTaskId={dowithTaskId}
        headerComponent={<TaskInfoHeader title={title} status={status} />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  taskInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  sectionDivider: {
    marginHorizontal: -20,
    height: 8,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_96,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusChipText: {
    ...theme.TYPOGRAPHY.CAPTION1_BASIC,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  quote: {
    ...theme.TYPOGRAPHY.TITLE_1,
    color: theme.COLORS.GRAY_SCALE.GRAY_70,
  },
  taskTitle: {
    ...theme.TYPOGRAPHY.TITLE_2,
  },
});

export { ReceivedFeedback };
