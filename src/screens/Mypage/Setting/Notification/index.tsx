import React from 'react';
import { StyleSheet, View } from 'react-native';

import { NotificationMenu } from 'components/Mypage/Setting/Menu';
import { theme } from 'styles/theme';
import { useStore } from 'stores/index';
import { useNotificationSettings } from 'hooks/queries/member/useNotificationSettings';

const Notification = () => {
  const { base, todoBot, marketing, feedback, updateNotificationSettings } = useStore(
    ({
      notificationSettings: { base, todoBot, marketing, feedback },
      notificationActions: { updateNotificationSettings },
    }) => ({ base, todoBot, marketing, feedback, updateNotificationSettings }),
  );
  const { mutate } = useNotificationSettings();

  const handleValue =
    ({ name, value }: { name: string; value: boolean }) =>
    () => {
      updateNotificationSettings({ [name]: value });
      const {
        notificationSettings: { base, todoBot, feedback, marketing },
      } = useStore.getState();

      mutate({
        baseAlarmYn: base,
        todoBotYn: todoBot,
        feedbackYn: feedback,
        marketingYn: marketing,
      });
    };

  return (
    <View style={styles.container}>
      <NotificationMenu
        title="기본 알림"
        subTitle="렛미두윗의 필수 알림으로 중요한 순간을 안내해요."
        value={base}
        handleValue={handleValue({ name: 'base', value: !base })}
      />
      <NotificationMenu
        title="재촉 알림"
        subTitle="시작 10분 전부터 완료시점까지 돕는 리마인드 알림입니다."
        value={todoBot}
        handleValue={handleValue({ name: 'todoBot', value: !todoBot })}
      />
      <NotificationMenu
        title="잔소리 알림"
        subTitle="잔소리와 공감으로 타두윗러들과 소통할 수 있는 알림입니다."
        value={feedback}
        handleValue={handleValue({ name: 'feedback', value: !feedback })}
      />
      <NotificationMenu
        title="마케팅 혜택 알림 "
        subTitle="다양한 소식과 혜택에 대한 알림입니다."
        value={marketing}
        handleValue={handleValue({ name: 'marketing', value: !marketing })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    borderTopWidth: 0.5,
    borderTopColor: theme.COLORS.DEFAULT.BLACK,
  },
});

export { Notification };
