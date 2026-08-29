import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { FeedbackEmoji } from 'components/Feedback/FeedbackEmoji';
import { ProfileImage } from 'components/common/ProfileImage';
import { Clock } from 'components/common/icons/Clock';
import { Thunder } from 'components/common/icons/Thunder';
import { PlusIcon } from 'components/common/icons/PlusIcon';
import { useDialog } from 'components/common/Dialog/Provider';
import { TASK_STATUS_ENUM } from 'schemes/task/enum';
import { ErrorStatusCodeEnum } from 'schemes/shared/enum';
import { TASK_QUERY_KEY } from 'constants/queries';
import { useFetchFeedbackTemplates } from 'hooks/queries/feedback/useFetchFeedbackTemplates';
import { useSendFeedback } from 'hooks/queries/feedback/useSendFeedback';
import { useFeedbackBarSwap } from 'hooks/shared/useFeedbackBarSwap';
import { theme } from 'styles/theme';
import { formatRemainingTime, getRemainingMinutes } from 'utils/date';
import type { taskFeedbackTemplateSchemeType } from 'types/feedback/scheme/api';
import type { myFeedbackSchemeType, feedbackAvailableDowithTaskSchemeType } from 'types/task/scheme/api';

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

/* 이하로 남으면 남은 시간을 강조 색으로 표시한다. */
const URGENT_THRESHOLD_MINUTES = 5;

/* contentInner의 자식 간 간격. 스왑 영역이 접힐 때 이 간격까지 함께 사라져야 빈 공간이 남지 않는다. */
const CONTENT_GAP = 12;

/* 오뚜기처럼 좌우로 흔들리다 멈추는 등장 연출의 시작 기울기 */
const WOBBLE_START_ANGLE = -18;

/*
 * "보낸 잔소리"에 새로 추가된 아이콘.
 * 회전에 감쇠가 약한 스프링을 걸어 좌우로 몇 번 흔들리다 멈추게 한다(오뚜기).
 * 크기는 감쇠를 세게 줘서 흔들리지 않고 한 번에 자리잡는다.
 */
const WobbleEmoji = ({ uri }: { uri: string }) => {
  const rotate = useSharedValue(WOBBLE_START_ANGLE);
  const scale = useSharedValue(0.6);

  useEffect(() => {
    rotate.value = withSpring(0, { damping: 4, stiffness: 260, mass: 0.6 });
    scale.value = withSpring(1, { damping: 14, stiffness: 300 });
  }, [rotate, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <FeedbackEmoji uri={uri} size={SENT_EMOJI_SIZE} />
    </Animated.View>
  );
};
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

  const hasFeedbacks = myFeedbacks.length > 0;
  /* 마운트 시점에 이미 있던 개수. 이후 늘어난 것만 등장 연출을 준다. */
  const initialFeedbackCount = React.useRef(myFeedbacks.length);

  const {
    containerAnimatedStyle,
    reactionAnimatedStyle,
    sentAnimatedStyle,
    toggleAnimatedStyle,
    handleReactionLayout,
    handleSentLayout,
  } = useFeedbackBarSwap({ showReactions, hasFeedbacks, gap: CONTENT_GAP });

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
    [sendFeedback, taskId, showDialog, hideDialog],
  );

  const reactionBarRef = React.useRef<View>(null);

  /*
   * 이모지 바의 화면상 하단 Y를 부모에 전달한다(가려짐 판단·스크롤용).
   * 이제 두 바가 항상 마운트돼 있어 onLayout이 펼침 시점에 오지 않으므로, 펼칠 때 직접 측정한다.
   * 레이어는 절대 배치라 컨테이너 높이 애니메이션과 무관하게 최종 위치를 바로 알려준다.
   */
  useEffect(() => {
    if (!showReactions) {
      return;
    }

    reactionBarRef.current?.measureInWindow((_x, y, _width, height) => {
      onExpand?.(y + height);
    });
  }, [showReactions, onExpand]);

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
  /* 마감이 임박하면(5분 이하) 시간 표시를 강조한다. */
  const isTimeUrgent = getRemainingMinutes(startTime) <= URGENT_THRESHOLD_MINUTES;

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.contentInner}>
          <View style={styles.topRow}>
            <ProfileImage uri={profileImageUrl} size={32} style={styles.image} />
            <Text style={styles.nickname}>{nickname}</Text>
          </View>
          <Text style={styles.taskDescription}>{title}</Text>
          <View style={styles.bottomRow}>
            <View style={styles.infoRow}>
              {remainingTime ? (
                <View style={styles.infoItem}>
                  <Clock
                    width={16}
                    height={16}
                    fill={isTimeUrgent ? theme.COLORS.PRIMARY.RED_92 : theme.COLORS.GRAY_SCALE.GRAY_80}
                  />
                  <Text style={[styles.info, isTimeUrgent && styles.infoUrgent]}>{remainingTime} 남음</Text>
                </View>
              ) : null}
              <View style={styles.infoItem}>
                <Thunder width={16} height={16} fill={theme.COLORS.GRAY_SCALE.GRAY_80} />
                <Text style={styles.info}>{feedbackCount}</Text>
              </View>
            </View>
            <Pressable style={styles.toggleButton} onPress={handlePressPlus}>
              <Animated.View style={toggleAnimatedStyle}>
                <PlusIcon width={16} height={16} fill={theme.COLORS.GRAY_SCALE.GRAY_40} />
              </Animated.View>
            </Pressable>
          </View>
          {/*
            선택 바와 "보낸 잡도리" 바를 같은 자리에 겹쳐 두고 opacity로 교차시킨다.
            높이가 서로 달라 컨테이너 높이도 함께 애니메이션한다.
          */}
          <Animated.View style={[styles.swapArea, containerAnimatedStyle]}>
            {templates && (
              <Animated.View
                ref={reactionBarRef}
                style={[styles.swapLayer, styles.reactionBarWrapper, reactionAnimatedStyle]}
                onLayout={handleReactionLayout}
                pointerEvents={showReactions ? 'auto' : 'none'}
              >
                <View style={styles.reactionBar}>
                  {templates.map(template => (
                    <Pressable key={template.id} style={styles.reactionButton} onPress={() => handleReaction(template)}>
                      <FeedbackEmoji uri={template.emojiUrl} size={48} />
                      {/* 둘러보기·실시간 잔소리하기의 잔소리 이모지 선택 UI에서만 줄바꿈으로 결합 */}
                      <Text style={styles.reactionMessage}>{template.nameTokens.join('\n')}</Text>
                    </Pressable>
                  ))}
                </View>
              </Animated.View>
            )}
            {hasFeedbacks && (
              <Animated.View
                style={[styles.swapLayer, styles.sentBubble, sentAnimatedStyle]}
                onLayout={e => {
                  handleSentLayout(e);
                  onBubbleLayout(e);
                }}
                pointerEvents="none"
              >
                <Text style={styles.sentLabel}>보낸 잔소리</Text>
                {visibleFeedbacks.map((feedback, index) => {
                  const template = templateMap.get(feedback.templateId);
                  if (!template) {
                    return null;
                  }
                  /*
                   * 화면에 처음 그려질 때 이미 있던 아이콘은 흔들지 않는다.
                   * 목록이 나타날 때마다 전부 흔들리면 산만하다. 이후 내가 보내서 늘어난 것만 연출한다.
                   */
                  if (index < initialFeedbackCount.current) {
                    return <FeedbackEmoji key={index} uri={template.emojiUrl} size={SENT_EMOJI_SIZE} />;
                  }

                  return <WobbleEmoji key={index} uri={template.emojiUrl} />;
                })}
                {overflowCount > 0 && <Text style={styles.overflowCount}>+{overflowCount}</Text>}
              </Animated.View>
            )}
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  /* 테두리 없는 평면 항목. 항목 사이 구분은 리스트가 그리는 구분선이 맡는다. */
  container: {
    paddingVertical: 16,
  },
  contentInner: {
    gap: 12,
  },
  /*
   * 두 바를 겹쳐 두는 영역. 높이는 애니메이션으로 지정되므로 넘치는 부분을 잘라낸다.
   * contentInner의 gap은 높이가 0이어도 남으므로 음수 마진으로 상쇄하고,
   * 대신 그 간격을 애니메이션 높이에 포함시켜 레이어를 CONTENT_GAP만큼 내려 배치한다.
   */
  swapArea: {
    overflow: 'hidden',
    marginTop: -CONTENT_GAP,
  },
  swapLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: CONTENT_GAP,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  image: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_96,
  },
  nickname: {
    ...theme.TYPOGRAPHY.BODY_2,
    color: theme.COLORS.GRAY_SCALE.GRAY_40,
  },
  taskDescription: {
    ...theme.TYPOGRAPHY.TITLE_3,
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
  info: { ...theme.TYPOGRAPHY.CAPTION1_BASIC, color: theme.COLORS.GRAY_SCALE.GRAY_40 },
  infoUrgent: { color: theme.COLORS.PRIMARY.RED_60 },
  toggleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_80,
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
