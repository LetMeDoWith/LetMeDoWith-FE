import React, { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useQueryClient } from '@tanstack/react-query';

import { Clock } from 'components/common/icons/Clock';
import { Thunder } from 'components/common/icons/Thunder';
import { PlusIcon } from 'components/common/icons/PlusIcon';
import { CancelIcon } from 'components/common/icons/CancelIcon';
import { ConfettiEffect } from 'components/common/ConfettiEffect';
import { TASK_QUERY_KEY } from 'constants/queries';
import { useFetchFeedbackTemplates } from 'hooks/queries/feedback/useFetchFeedbackTemplates';
import { useFeedbackAnimation } from 'hooks/shared/useFeedbackAnimation';
import { theme } from 'styles/theme';
import { formatRemainingTime } from 'utils/date';
import type { taskFeedbackTemplateSchemeType } from 'types/feedback/scheme/api';

interface Props {
  badgeImageUrl: string;
  nickname: string;
  title: string;
  startTime: string;
  feedbackCount: number;
}

const FeedNagItem = ({ badgeImageUrl, nickname, title, startTime, feedbackCount }: Props) => {
  const queryClient = useQueryClient();
  const { data: templates } = useFetchFeedbackTemplates();
  const [showReactions, setShowReactions] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<taskFeedbackTemplateSchemeType | null>(null);

  const { isAnimating, animatingTemplate, animationTrigger, contentAnimatedStyle, emojiAnimatedStyle, startAnimation } =
    useFeedbackAnimation();

  const handleReaction = useCallback(
    (template: taskFeedbackTemplateSchemeType) => {
      setSelectedTemplate(template);
      setShowReactions(false);
      startAnimation(template);

      // TODO: 피드백 전송 API 연동
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY.FEEDBACK_AVAILABLE_DOWITH_TASKS });
    },
    [startAnimation, queryClient],
  );

  const remainingTime = formatRemainingTime(startTime);

  return (
    <View style={styles.container}>
      {isAnimating && (
        <ConfettiEffect trigger={animationTrigger} delay={400} style={styles.animationOverlay}>
          <Animated.Image
            source={{ uri: animatingTemplate?.emojiUrl }}
            style={[styles.animatingEmoji, emojiAnimatedStyle]}
          />
        </ConfettiEffect>
      )}

      <Animated.View style={contentAnimatedStyle}>
        <View style={styles.contentInner}>
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
            <Pressable style={styles.toggleButton} onPress={() => setShowReactions(prev => !prev)}>
              {showReactions ? (
                <CancelIcon width={16} height={16} fill={theme.COLORS.GRAY_SCALE.GRAY_40} />
              ) : (
                <PlusIcon width={16} height={16} fill={theme.COLORS.GRAY_SCALE.GRAY_40} />
              )}
            </Pressable>
          </View>
          {showReactions && templates && (
            <View style={styles.reactionBarWrapper}>
              <View style={styles.reactionBar}>
                {templates.map(template => (
                  <Pressable key={template.id} style={styles.reactionButton} onPress={() => handleReaction(template)}>
                    <Image source={{ uri: template.emojiUrl }} style={styles.reactionEmoji} />
                    <Text style={styles.reactionMessage}>{template.message}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
          {selectedTemplate && !showReactions && !isAnimating && (
            <View style={styles.sentBubble}>
              <Text style={styles.sentLabel}>보낸 잔소리</Text>
              <Image source={{ uri: selectedTemplate.emojiUrl }} style={styles.sentEmoji} />
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderWidth: 1,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_92,
    borderRadius: 12,
  },
  contentInner: {
    gap: 12,
  },
  animationOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  animatingEmoji: {
    width: 80,
    height: 80,
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
  reactionBarWrapper: {
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_96,
    borderRadius: 12,
    padding: 12,
  },
  reactionBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 12,
  },
  reactionButton: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  reactionEmoji: {
    width: 48,
    height: 48,
  },
  reactionMessage: {
    ...theme.TYPOGRAPHY.CAPTION1_BASIC,
    color: theme.COLORS.GRAY_SCALE.GRAY_50,
    textAlign: 'center',
  },
  sentBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_98,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    gap: 8,
  },
  sentLabel: {
    ...theme.TYPOGRAPHY.CAPTION1_BASIC,
    color: theme.COLORS.GRAY_SCALE.GRAY_60,
  },
  sentEmoji: {
    width: 24,
    height: 24,
  },
});

export { FeedNagItem };
