import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DoubleThunder } from 'components/common/icons/DoubleThunder';
import { FeedNagItem } from 'components/Feed/FeedNagItem';
import { theme } from 'styles/theme';

// TODO: API 연동 후 제거
const MOCK_DATA = [
  {
    id: 1,
    profileImageUrl: 'https://i.pravatar.cc/150?img=1',
    nickname: '잔소리대장님',
    taskDescription: '스트레칭하고 유산소 30분',
    remainingTime: '2시간 30분',
    nagCount: 11,
  },
  {
    id: 2,
    profileImageUrl: 'https://i.pravatar.cc/150?img=2',
    nickname: '갓생러님',
    taskDescription: '영화 리스트 추리기',
    remainingTime: '1시간 20분',
    nagCount: 5,
  },
  {
    id: 3,
    profileImageUrl: 'https://i.pravatar.cc/150?img=3',
    nickname: '두윗마스터님',
    taskDescription: '퇴근 후 선물 픽업',
    remainingTime: '3시간',
    nagCount: 8,
  },
  {
    id: 4,
    profileImageUrl: 'https://i.pravatar.cc/150?img=4',
    nickname: '열공러님',
    taskDescription: '알고리즘 문제 2개 풀기',
    remainingTime: '45분',
    nagCount: 3,
  },
  {
    id: 5,
    profileImageUrl: 'https://i.pravatar.cc/150?img=5',
    nickname: '행복한호두',
    taskDescription: '저녁 집밥 해먹기',
    remainingTime: '4시간',
    nagCount: 7,
  },
  {
    id: 6,
    profileImageUrl: 'https://i.pravatar.cc/150?img=6',
    nickname: '새벽감성님',
    taskDescription: '독서 30분 하기',
    remainingTime: '1시간 50분',
    nagCount: 2,
  },
  {
    id: 7,
    profileImageUrl: 'https://i.pravatar.cc/150?img=7',
    nickname: '운동왕님',
    taskDescription: '헬스장 가서 하체 루틴',
    remainingTime: '2시간',
    nagCount: 15,
  },
  {
    id: 8,
    profileImageUrl: 'https://i.pravatar.cc/150?img=8',
    nickname: '미라클모닝님',
    taskDescription: '일기 쓰기',
    remainingTime: '30분',
    nagCount: 1,
  },
  {
    id: 9,
    profileImageUrl: 'https://i.pravatar.cc/150?img=9',
    nickname: '코딩마스터님',
    taskDescription: '사이드 프로젝트 커밋 하나',
    remainingTime: '5시간',
    nagCount: 9,
  },
  {
    id: 10,
    profileImageUrl: 'https://i.pravatar.cc/150?img=10',
    nickname: '정리왕님',
    taskDescription: '방 청소하고 빨래 널기',
    remainingTime: '1시간',
    nagCount: 4,
  },
];

const FeedNagList = () => {
  return (
    <View style={styles.container}>
      <View style={styles.titleSection}>
        <DoubleThunder width={16} height={16} />
        <Text style={theme.TYPOGRAPHY.TITLE_2}>실시간 잔소리하기</Text>
      </View>
      <View style={styles.list}>
        {MOCK_DATA.slice(0, 5).map(item => (
          <FeedNagItem
            key={item.id}
            profileImageUrl={item.profileImageUrl}
            nickname={item.nickname}
            taskDescription={item.taskDescription}
            remainingTime={item.remainingTime}
            nagCount={item.nagCount}
          />
        ))}
      </View>
      {MOCK_DATA.length > 5 && (
        <Pressable
          style={styles.moreButton}
          onPress={() => {
            // TODO: 실시간 잔소리하기 스크린으로 이동
          }}
        >
          <Text style={styles.moreButtonText}>잔소리 더 하러가기</Text>
        </Pressable>
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
