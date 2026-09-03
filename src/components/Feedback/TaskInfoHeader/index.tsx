import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { QuoteClose, QuoteOpen } from 'components/common/icons/QuoteMark';
import { theme } from 'styles/theme';
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
  SUCCESS: {
    label: '성공',
    backgroundColor: theme.COLORS.SECONDARY.BLUE_95,
    color: theme.COLORS.SECONDARY.BLUE_50,
  },
};

interface Props {
  title: string;
  status: TaskStatusEnumType;
  /*
   * 시안상 배치가 두 가지다.
   * STACK — 인증 전·실패. 칩 아래에 따옴표를 두른 제목이 가운데 정렬로 놓인다.
   * INLINE — 인증 후. 인증 사진 밑이라 칩과 제목이 한 줄에 좌측 정렬로 붙고 따옴표가 없다.
   */
  layout?: 'STACK' | 'INLINE';
}

/* 잡도리 모아보기 상단의 태스크 상태칩 + 제목. 아래 구분 밴드까지 포함한다. */
const TaskInfoHeader = ({ title, status, layout = 'STACK' }: Props) => {
  const config = STATUS_CONFIG[status];
  const isInline = layout === 'INLINE';

  return (
    <>
      <View style={isInline ? styles.inlineTaskInfo : styles.taskInfo}>
        {config && (
          <View style={[styles.statusChip, { backgroundColor: config.backgroundColor }]}>
            <Text style={[styles.statusChipText, { color: config.color }]}>{config.label}</Text>
          </View>
        )}
        {isInline ? (
          <Text style={styles.inlineTaskTitle} numberOfLines={1}>
            {title}
          </Text>
        ) : (
          <View style={styles.titleRow}>
            <QuoteOpen />
            <Text style={styles.taskTitle}>{title}</Text>
            <QuoteClose />
          </View>
        )}
      </View>
      <View style={styles.sectionDivider} />
    </>
  );
};

const styles = StyleSheet.create({
  taskInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  inlineTaskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  /* 목록의 좌우 여백(20)을 상쇄해 화면 끝까지 채운다 */
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
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 12,
  },
  taskTitle: {
    ...theme.TYPOGRAPHY.TITLE_2,
  },
  inlineTaskTitle: {
    ...theme.TYPOGRAPHY.TITLE_3,
    flexShrink: 1,
  },
});

export { TaskInfoHeader };
