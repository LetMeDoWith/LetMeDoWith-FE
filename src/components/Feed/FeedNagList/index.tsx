import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { DoubleThunder } from 'components/common/icons/DoubleThunder';
import { FeedNagItem } from 'components/Feed/FeedNagItem';
import { useFetchFeedbackAvailableDowithTasksInfinite } from 'hooks/queries/task/useFetchFeedbackAvailableDowithTasksInfinite';
import type { RootStackParamList } from 'types/shared';
import { theme } from 'styles/theme';

const DISPLAY_COUNT = 5;

interface Props {
  // 항목의 잔소리 이모지가 펼쳐질 때 호출(이모지 바 하단 Y 전달). 부모 ScrollView가 가려지면 스크롤한다.
  onItemExpand?: (reactionBarBottomY: number) => void;
}

const FeedNagList = ({ onItemExpand }: Props) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { data, isLoading } = useFetchFeedbackAvailableDowithTasksInfinite();

  const firstPage = data?.pages[0];
  const dowithTasks = (firstPage?.data.dowithTasks ?? []).slice(0, DISPLAY_COUNT);
  const hasMore = (firstPage?.totalCount ?? 0) > DISPLAY_COUNT;

  return (
    <View style={styles.container}>
      <View style={styles.titleSection}>
        <DoubleThunder width={16} height={16} />
        <Text style={theme.TYPOGRAPHY.TITLE_1}>실시간 잔소리하기</Text>
      </View>
      {isLoading && <ActivityIndicator />}
      {!isLoading && dowithTasks.length > 0 && (
        <>
          <View style={styles.list}>
            {dowithTasks.map((item, index) => (
              <React.Fragment key={item.id}>
                {/* 항목 사이에만 구분선을 둔다. 마지막 뒤에는 넣지 않는다. */}
                {index > 0 && <View style={styles.divider} />}
                <FeedNagItem
                  taskId={item.id}
                  profileImageUrl={item.profileImageUrl}
                  nickname={item.nickname}
                  title={item.title}
                  date={item.date}
                  startTime={item.startTime}
                  status={item.status}
                  feedbackCount={item.feedbackCount}
                  myFeedbacks={item.myFeedbacks}
                  onExpand={onItemExpand}
                />
              </React.Fragment>
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
  /* 항목이 자체 상하 여백을 가지므로 리스트는 간격을 두지 않는다(구분선이 붙어야 한다). */
  list: {},
  divider: {
    height: 1,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_92,
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
