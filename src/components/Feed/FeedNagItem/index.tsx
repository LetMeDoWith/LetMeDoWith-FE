import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import { Clock } from 'components/common/icons/Clock';
import { Thunder } from 'components/common/icons/Thunder';
import { PlusIcon } from 'components/common/icons/PlusIcon';
import { CancelIcon } from 'components/common/icons/CancelIcon';
import { TASK_QUERY_KEY } from 'constants/queries';
import { theme } from 'styles/theme';
import { formatRemainingTime } from 'utils/date';

interface Props {
  badgeImageUrl: string;
  nickname: string;
  title: string;
  startTime: string;
  feedbackCount: number;
}

const REACTION_EMOJIS = ['😆', '😡', '🤣', '👏'];

const FeedNagItem = ({ badgeImageUrl, nickname, title, startTime, feedbackCount }: Props) => {
  const queryClient = useQueryClient();
  const [showReactions, setShowReactions] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  const handleReaction = (emoji: string) => {
    setSelectedEmoji(emoji);
    setShowReactions(false);
    // TODO: 피드백 전송 API 연동
    queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY.FEEDBACK_AVAILABLE_DOWITH_TASKS });
  };

  const remainingTime = formatRemainingTime(startTime);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Image style={styles.image} source={{ uri: badgeImageUrl }} />
        <Text style={styles.nickname}>{nickname}</Text>
      </View>
      <Text style={styles.taskDescription}>{title}</Text>
      <View style={styles.bottomRow}>
        <View style={styles.infoRow}>
          {remainingTime ? (
            <View style={styles.infoItem}>
              <Clock width={12} height={12} fill={theme.COLORS.GRAY_SCALE.GRAY_80} />
              <Text style={styles.info}>{remainingTime} 남음</Text>
            </View>
          ) : null}
          <View style={styles.infoItem}>
            <Thunder width={12} height={12} fill={theme.COLORS.GRAY_SCALE.GRAY_80} />
            <Text style={styles.info}>{feedbackCount}</Text>
          </View>
        </View>
        {selectedEmoji ? (
          <Text style={styles.selectedEmoji}>{selectedEmoji}</Text>
        ) : (
          <Pressable style={styles.toggleButton} onPress={() => setShowReactions(prev => !prev)}>
            {showReactions ? (
              <CancelIcon width={16} height={16} fill={theme.COLORS.GRAY_SCALE.GRAY_40} />
            ) : (
              <PlusIcon width={16} height={16} fill={theme.COLORS.GRAY_SCALE.GRAY_40} />
            )}
          </Pressable>
        )}
      </View>
      {showReactions && (
        <View style={styles.reactionBarWrapper}>
          <View style={styles.reactionBar}>
            {REACTION_EMOJIS.map(emoji => (
              <Pressable key={emoji} style={styles.reactionButton} onPress={() => handleReaction(emoji)}>
                <Text style={styles.reactionEmoji}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.reactionLabel}>스티커로 잔소리하기</Text>
        </View>
      )}
      {selectedEmoji && !showReactions && (
        <View style={styles.confirmBubble}>
          <Text style={styles.confirmText}>잔소리 발송 성공!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderWidth: 1,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_92,
    borderRadius: 12,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  image: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  nickname: {
    ...theme.TYPOGRAPHY.CAPTION1_BASIC,
    color: theme.COLORS.GRAY_SCALE.GRAY_30,
  },
  taskDescription: {
    ...theme.TYPOGRAPHY.BODY_2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  info: { ...theme.TYPOGRAPHY.CAPTION1_BASIC, color: theme.COLORS.GRAY_SCALE.GRAY_60 },
  toggleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_96,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedEmoji: {
    fontSize: 18,
  },
  reactionBarWrapper: {
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_96,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    alignItems: 'center',
  },
  reactionLabel: {
    ...theme.TYPOGRAPHY.CAPTION1_BASIC,
    color: theme.COLORS.GRAY_SCALE.GRAY_50,
  },
  reactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reactionButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionEmoji: {
    fontSize: 22,
  },
  confirmBubble: {
    marginTop: 8,
    marginLeft: 56,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_96,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  confirmText: {
    ...theme.TYPOGRAPHY.CAPTION1_BASIC,
    color: theme.COLORS.GRAY_SCALE.GRAY_50,
  },
});

export { FeedNagItem };
