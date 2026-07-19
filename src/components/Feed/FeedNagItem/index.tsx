import React, { useCallback, useMemo, useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import Animated from 'react-native-reanimated';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { FeedbackEmoji, FeedbackSvg, isSvgUri } from 'components/Feedback/FeedbackEmoji';
import { Clock } from 'components/common/icons/Clock';
import { Thunder } from 'components/common/icons/Thunder';
import { PlusIcon } from 'components/common/icons/PlusIcon';
import { CancelIcon } from 'components/common/icons/CancelIcon';
import { ConfettiEffect } from 'components/common/ConfettiEffect';
import { useDialog } from 'components/common/Dialog/Provider';
import { TASK_STATUS_ENUM } from 'schemes/task/enum';
import { ErrorStatusCodeEnum } from 'schemes/shared/enum';
import { TASK_QUERY_KEY } from 'constants/queries';
import { useFetchFeedbackTemplates } from 'hooks/queries/feedback/useFetchFeedbackTemplates';
import { useSendFeedback } from 'hooks/queries/feedback/useSendFeedback';
import { useFeedbackAnimation } from 'hooks/shared/useFeedbackAnimation';
import { theme } from 'styles/theme';
import { formatRemainingTime } from 'utils/date';
import type { taskFeedbackTemplateSchemeType } from 'types/feedback/scheme/api';
import type { myFeedbackSchemeType, feedbackAvailableDowithTaskSchemeType } from 'types/task/scheme/api';

// 회전 이모지도 FastImage로 통일 (RN Image 캐시 분리로 인한 이전 이모지 노출 방지)
const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);

interface Props {
  taskId: number;
  profileImageUrl: string;
  nickname: string;
  title: string;
  date: string;
  startTime: string;
  status: feedbackAvailableDowithTaskSchemeType['status'];
  feedbackCount: number;
  myFeedbacks: myFeedbackSchemeType[];
  /*
   * 잔소리 이모지가 펼쳐졌을 때 호출. 이모지 바의 화면상 하단 Y(window 기준)를 넘겨, 부모가 가려지면 스크롤한다.
   * FlatList(실시간 잔소리)는 인자를 무시하고 scrollToIndex를 쓰고, ScrollView(둘러보기)는 이 값으로 스크롤 양을 계산한다.
   */
  onExpand?: (reactionBarBottomY: number) => void;
}

// "보낸 잔소리" 라벨 예상 너비 + paddingHorizontal + gap
const SENT_LABEL_WIDTH = 70;
const SENT_EMOJI_SIZE = 24;
const SENT_EMOJI_GAP = 8;
const OVERFLOW_TEXT_WIDTH = 40;
const SENT_BUBBLE_PADDING_H = 12;

const FeedNagItem = ({
  taskId,
  profileImageUrl,
  nickname,
  title,
  date,
  startTime,
  status,
  feedbackCount,
  myFeedbacks,
  onExpand,
}: Props) => {
  const queryClient = useQueryClient();
  const { data: templates } = useFetchFeedbackTemplates();
  const { mutate: sendFeedback } = useSendFeedback();
  const { showDialog, hideDialog } = useDialog();
  const [showReactions, setShowReactions] = useState(false);

  const { isAnimating, animatingTemplate, animationTrigger, contentAnimatedStyle, emojiAnimatedStyle, startAnimation } =
    useFeedbackAnimation();

  const templateMap = React.useMemo(() => {
    const map = new Map<number, taskFeedbackTemplateSchemeType>();
    templates?.forEach(t => map.set(t.id, t));
    return map;
  }, [templates]);

  const handlePressPlus = useCallback(() => {
    if (showReactions) {
      setShowReactions(false);
      return;
    }

    const taskDateTime = dayjs(`${date} ${startTime}`);
    const isExpired = taskDateTime.add(1, 'hour').isBefore(dayjs());

    if (isExpired) {
      showDialog({
        type: 'ALERT',
        title: '시간이 지난 두윗이에요!',
        content: '잔소리를 고민하는 사이\n해당 두윗 시간이 지났어요.',
        handleAlertButton: () => {
          hideDialog();
          queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY.FEEDBACK_AVAILABLE_DOWITH_TASKS });
        },
      });
      return;
    }

    if (status === TASK_STATUS_ENUM.enum.SUCCESS) {
      showDialog({
        type: 'ALERT',
        title: '이미 완료된 두윗이에요!',
        content: '잔소리를 고민하는 사이,\n해당 두윗러가 인증을 마쳤어요.',
        handleAlertButton: () => {
          hideDialog();
          queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY.FEEDBACK_AVAILABLE_DOWITH_TASKS });
        },
      });
      return;
    }

    setShowReactions(true);
  }, [showReactions, date, startTime, status, queryClient, showDialog, hideDialog]);

  const handleReaction = useCallback(
    (template: taskFeedbackTemplateSchemeType) => {
      setShowReactions(false);
      sendFeedback(
        { taskId, templateId: template.id },
        {
          onSuccess: () => startAnimation(template),
          onError: e => {
            if (e.response?.data?.statusCode === ErrorStatusCodeEnum.enum.E250) {
              showDialog({
                type: 'ALERT',
                title: '잔소리 쿨타임 ⏳',
                content: '잔소리도 쿨타임이 필요해요.\n1분 후에 다시 발송할 수 있어요.',
                handleAlertButton: hideDialog,
              });
            }
          },
        },
      );
    },
    [startAnimation, sendFeedback, taskId, showDialog, hideDialog],
  );

  const reactionBarRef = React.useRef<View>(null);

  // 펼침 레이아웃 후 이모지 바의 화면상 하단 Y를 측정해 부모에 전달(가려짐 판단·스크롤용)
  const handleReactionBarLayout = useCallback(() => {
    reactionBarRef.current?.measureInWindow((_x, y, _width, height) => {
      onExpand?.(y + height);
    });
  }, [onExpand]);

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
          {isSvgUri(animatingTemplate?.emojiUrl) ? (
            <Animated.View style={[styles.animatingEmoji, emojiAnimatedStyle]}>
              <FeedbackSvg uri={animatingTemplate?.emojiUrl ?? ''} size={80} />
            </Animated.View>
          ) : (
            <AnimatedFastImage
              key={animatingTemplate?.id}
              source={{ uri: animatingTemplate?.emojiUrl }}
              style={[styles.animatingEmoji, emojiAnimatedStyle]}
            />
          )}
        </ConfettiEffect>
      )}

      <Animated.View style={contentAnimatedStyle}>
        <View style={styles.contentInner}>
          <View style={styles.topRow}>
            <FastImage style={styles.image} source={{ uri: profileImageUrl }} />
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
            <Pressable style={styles.toggleButton} onPress={handlePressPlus}>
              {showReactions ? (
                <CancelIcon width={16} height={16} fill={theme.COLORS.GRAY_SCALE.GRAY_40} />
              ) : (
                <PlusIcon width={16} height={16} fill={theme.COLORS.GRAY_SCALE.GRAY_40} />
              )}
            </Pressable>
          </View>
          {showReactions && templates && (
            <View ref={reactionBarRef} style={styles.reactionBarWrapper} onLayout={handleReactionBarLayout}>
              <View style={styles.reactionBar}>
                {templates.map(template => (
                  <Pressable key={template.id} style={styles.reactionButton} onPress={() => handleReaction(template)}>
                    <FeedbackEmoji uri={template.emojiUrl} size={48} />
                    {/* 둘러보기·실시간 잔소리하기의 잔소리 이모지 선택 UI에서만 줄바꿈으로 결합 */}
                    <Text style={styles.reactionMessage}>{template.nameTokens.join('\n')}</Text>
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
                return <FeedbackEmoji key={index} uri={template.emojiUrl} size={24} />;
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
  overflowCount: {
    ...theme.TYPOGRAPHY.CAPTION1_BASIC,
    color: theme.COLORS.GRAY_SCALE.GRAY_60,
  },
});

export { FeedNagItem };
