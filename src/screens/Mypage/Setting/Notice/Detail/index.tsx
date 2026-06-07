import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import dayjs from 'dayjs';

import { useFetchNoticeDetail } from 'hooks/queries/notice/useFetchNoticeDetail';
import { theme } from 'styles/theme';
import type { SettingStackScreenProps } from 'types/shared';

const NoticeDetail = ({ route: { params } }: SettingStackScreenProps<'NOTICE_DETAIL'>) => {
  const { data } = useFetchNoticeDetail(params.id);

  if (!data) {
    return null;
  }

  const { title, content, type, createdAt } = data.data;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.type}>[{type === 'NOTICE' ? '공지' : '이벤트'}]</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.date}>{dayjs(createdAt).format('YYYY.MM.DD')}</Text>
      </View>
      <View style={styles.divider} />
      <Text style={styles.content}>{content}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
  },
  header: {
    gap: 8,
    paddingTop: 20,
    paddingBottom: 16,
  },
  type: {
    ...theme.TYPOGRAPHY.BODY_2,
    color: theme.COLORS.GRAY_SCALE.GRAY_50,
  },
  title: {
    ...theme.TYPOGRAPHY.TITLE_2,
  },
  date: {
    ...theme.TYPOGRAPHY.CAPTION1_BASIC,
    color: theme.COLORS.GRAY_SCALE.GRAY_60,
  },
  divider: {
    height: 1,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_92,
  },
  content: {
    ...theme.TYPOGRAPHY.BODY_2,
    paddingVertical: 16,
  },
});

export { NoticeDetail };
