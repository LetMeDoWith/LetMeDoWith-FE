import React, { useCallback, useMemo, useState } from 'react';
import { Image, type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Clock } from 'components/common/icons/Clock';
import { Thunder } from 'components/common/icons/Thunder';
import { PlusIcon } from 'components/common/icons/PlusIcon';
import { CancelIcon } from 'components/common/icons/CancelIcon';
import { ConfettiEffect } from 'components/common/ConfettiEffect';
import { useFetchFeedbackTemplates } from 'hooks/queries/feedback/useFetchFeedbackTemplates';
import { useSendFeedback } from 'hooks/queries/feedback/useSendFeedback';
import { useFeedbackAnimation } from 'hooks/shared/useFeedbackAnimation';
import { theme } from 'styles/theme';
import { formatRemainingTime } from 'utils/date';
import type { taskFeedbackTemplateSchemeType } from 'types/feedback/scheme/api';
import type { myFeedbackSchemeType } from 'types/task/scheme/api';

interface Props {
  taskId: number;
  badgeImageUrl: string;
  nickname: string;
  title: string;
  startTime: string;
  feedbackCount: number;
  myFeedbacks: myFeedbackSchemeType[];
}

// "보낸 잔소리" 라벨 예상 너비 + paddingHorizontal + gap
const SENT_LABEL_WIDTH = 70;
const SENT_EMOJI_SIZE = 24;
const SENT_EMOJI_GAP = 8;
const OVERFLOW_TEXT_WIDTH = 40;
const SENT_BUBBLE_PADDING_H = 12;

const FeedNagItem = ({
  taskId,
  badgeImageUrl,
  nickname,
  title,
  startTime,
  feedbackCount,
  myFeedbacks,
}: Props) => {
  const { data: templates } = useFetchFeedbackTemplates();
  const { mutate: sendFeedback } = useSendFeedback();
  const [showReactions, setShowReactions] = useState(false);

  const { isAnimating, animatingTemplate, animationTrigger, contentAnimatedStyle, emojiAnimatedStyle, startAnimation } =
    useFeedbackAnimation();

  const templateMap = React.useMemo(() => {
    const map = new Map<number, taskFeedbackTemplateSchemeType>();
    templates?.forEach(t => map.set(t.id, t));
    return map;
  }, [templates]);

  const handleReaction = useCallback(
    (template: taskFeedbackTemplateSchemeType) => {
      setShowReactions(false);
      startAnimation(template);
      sendFeedback({ taskId, templateId: template.id });
    },
    [startAnimation, sendFeedback, taskId],
  );

  const [bubbleWidth, setBubbleWidth] = useState(0);

  const onBubbleLayout = useCallback((e: LayoutChangeEvent) => {
    setBubbleWidth(e.nativeEvent.layout.width);
  }, []);

  const { visibleFeedbacks, overflowCount } = useMemo(() => {
    if (bubbleWidth === 0 || myFeedbacks.length === 0) {
      return { visibleFeedbacks: myFeedbacks, overflowCount: 0 };
    }

    const availableWidth = bubbleWidth - SENT_BUBBLE_PADDING_H * 2 - SENT_LABEL_WIDTH;
    const maxWithOverflow = Math.floor((availableWidth - OVERFLOW_TEXT_WIDTH) / (SENT_EMOJI_SIZE + SENT_EMOJI_GAP));
    const maxWithoutOverflow = Math.floor(availableWidth / (SENT_EMOJI_SIZE + SENT_EMOJI_GAP));

    if (myFeedbacks.length <= maxWithoutOverflow) {
      return { visibleFeedbacks: myFeedbacks, overflowCount: 0 };
    }

    const visibleCount = Math.max(1, maxWithOverflow);
    return {
      visibleFeedbacks: myFeedbacks.slice(0, visibleCount),
      overflowCount: myFeedbacks.length - visibleCount,
    };
  }, [bubbleWidth, myFeedbacks]);

  const remainingTime = formatRemainingTime(startTime);
  const hasFeedbacks = myFeedbacks.length > 0;

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
          {hasFeedbacks && !showReactions && !isAnimating && (
            <View style={styles.sentBubble} onLayout={onBubbleLayout}>
              <Text style={styles.sentLabel}>보낸 잔소리</Text>
              {visibleFeedbacks.map((feedback, index) => {
                const template = templateMap.get(feedback.templateId);
                if (!template) {
                  return null;
                }
                return <Image key={index} source={{ uri: template.emojiUrl }} style={styles.sentEmoji} />;
              })}
              {overflowCount > 0 && <Text style={styles.overflowCount}>+{overflowCount}</Text>}
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
  overflowCount: {
    ...theme.TYPOGRAPHY.CAPTION1_BASIC,
    color: theme.COLORS.GRAY_SCALE.GRAY_60,
  },
});

export { FeedNagItem };
