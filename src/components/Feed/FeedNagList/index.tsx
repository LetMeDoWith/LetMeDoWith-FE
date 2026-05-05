import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { DoubleThunder } from 'components/common/icons/DoubleThunder';
import { FeedNagItem } from 'components/Feed/FeedNagItem';
import { FeedNagEmpty } from 'components/Feed/FeedNagEmpty';
import { useFetchFeedbackAvailableDowithTasks } from 'hooks/queries/task/useFetchFeedbackAvailableDowithTasks';
import type { RootStackParamList } from 'types/shared';
import { theme } from 'styles/theme';

const DISPLAY_COUNT = 5;

const FeedNagList = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { data, isLoading } = useFetchFeedbackAvailableDowithTasks();

  const allTasks = data?.dowithTasks ?? [];
  const dowithTasks = allTasks.slice(0, DISPLAY_COUNT);
  const hasMore = allTasks.length > DISPLAY_COUNT;

  return (
    <View style={styles.container}>
      <View style={styles.titleSection}>
        <DoubleThunder width={16} height={16} />
        <Text style={theme.TYPOGRAPHY.TITLE_2}>실시간 잔소리하기</Text>
      </View>
      {isLoading && <ActivityIndicator />}
      {!isLoading && allTasks.length === 0 && <FeedNagEmpty />}
      {!isLoading && allTasks.length > 0 && (
        <>
          <View style={styles.list}>
            {dowithTasks.map(item => (
              <FeedNagItem
                key={item.id}
                taskId={item.id}
                badgeImageUrl={item.badgeImageUrl}
                nickname={item.nickname}
                title={item.title}
                startTime={item.startTime}
                feedbackCount={item.feedbackCount}
                myFeedbacks={item.myFeedbacks}
              />
            ))}
          </View>
          {hasMore && (
            <Pressable style={styles.moreButton} onPress={() => navigation.navigate('REALTIME_NAG')}>
              <Text style={styles.moreButtonText}>잔소리 더 하러가기</Text>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  titleSection: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  list: {
    gap: 16,
  },
  moreButton: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_96,
    alignItems: 'center',
  },
  moreButtonText: {
    ...theme.TYPOGRAPHY.BODY_1,
    color: theme.COLORS.GRAY_SCALE.GRAY_40,
  },
});

export { FeedNagList };
