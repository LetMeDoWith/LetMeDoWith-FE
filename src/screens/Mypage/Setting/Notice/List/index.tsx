import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Item } from 'components/Mypage/Setting/Notice';
import { useFetchNotices } from 'hooks/queries/notice/useFetchNotices';
import { theme } from 'styles/theme';
import type { SettingStackScreenProps } from 'types/shared';

const NoticeList = ({ navigation }: SettingStackScreenProps<'NOTICE'>) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useFetchNotices();

  const notices = useMemo(() => data?.pages.flatMap(page => page.data.notices) ?? [], [data]);

  if (notices.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>등록된 공지사항이 없어요.</Text>
      </View>
    );
  }

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notices}
        renderItem={({ item }) => (
          <Item id={item.id} type={item.type} title={item.title} date={item.createdAt} navigation={navigation} />
        )}
        keyExtractor={item => item.id.toString()}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
  },
  emptyText: {
    ...theme.TYPOGRAPHY.BODY_1,
    color: theme.COLORS.GRAY_SCALE.GRAY_50,
  },
  separator: {
    height: 1,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_92,
  },
});

export { NoticeList };
