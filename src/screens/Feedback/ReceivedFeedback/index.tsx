import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ReceivedFeedbackContent } from 'components/Feedback/ReceivedFeedbackContent';
import { useFetchDowithTask } from 'hooks/queries/task/useFetchDowithTask';
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

const ReceivedFeedback = ({ navigation, route }: RootStackScreenProps<'RECEIVED_FEEDBACK'>) => {
  // 딥링크로 진입하면 dowithTaskId가 문자열로 전달될 수 있어 숫자로 보정
  const dowithTaskId = Number(route.params.dowithTaskId);

  // 상태칩/제목은 상세 조회로 채운다 (Item 진입 시에는 캐시된 값이 즉시 사용됨)
  const { data: dowithTask } = useFetchDowithTask({ dowithTaskId });

  // 인증 완료(성공) 태스크로 딥링크 진입한 경우 응원 모아보기 화면으로 대체 이동
  useEffect(() => {
    const successImageUrl = dowithTask?.successImageUrls?.[0];
    if (successImageUrl) {
      navigation.replace('CHEER_COLLECTION', { dowithTaskId, successImageUrl });
    }
  }, [dowithTask, dowithTaskId, navigation]);

  const title = dowithTask?.title ?? '';
  const status = dowithTask?.status ?? 'WAIT';

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
