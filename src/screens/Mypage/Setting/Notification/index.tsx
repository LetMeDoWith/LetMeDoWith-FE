import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Linking } from 'react-native';

import { NotificationMenu } from 'components/Mypage/Setting/Menu';
import { useStore } from 'stores/index';
import { useNotificationSettings } from 'hooks/queries/member/useNotificationSettings';
import { useAppState } from 'hooks/shared/useAppState';
import { checkSystemPermission } from 'utils/notification';
import { useDialog } from 'components/common/Dialog/Provider';

const Notification = () => {
  const { base, todoBot, marketing, feedback, updateNotificationSettings } = useStore(
    ({
      notificationSettings: { base, todoBot, marketing, feedback },
      notificationActions: { updateNotificationSettings },
    }) => ({ base, todoBot, marketing, feedback, updateNotificationSettings }),
  );
  const { mutate } = useNotificationSettings();
  const { showDialog, hideDialog } = useDialog();
  const pendingToggleRef = useRef<{ name: string; value: boolean } | null>(null);

  const syncPermissionState = async () => {
    const isGranted = await checkSystemPermission();

    if (!isGranted) {
      updateNotificationSettings({ base: false, todoBot: false, feedback: false, marketing: false });
      mutate({ baseAlarmYn: false, todoBotYn: false, feedbackYn: false, marketingYn: false });
      pendingToggleRef.current = null;
      return;
    }

    // 시스템 알림 허용 상태에서 pending toggle이 있으면 적용
    if (pendingToggleRef.current) {
      const { name, value } = pendingToggleRef.current;
      pendingToggleRef.current = null;

      updateNotificationSettings({ [name]: value });
      const { notificationSettings } = useStore.getState();
      mutate({
        baseAlarmYn: notificationSettings.base,
        todoBotYn: notificationSettings.todoBot,
        feedbackYn: notificationSettings.feedback,
        marketingYn: notificationSettings.marketing,
      });
    }
  };

  // active 복귀 시 권한 동기화 + pending toggle 적용
  useAppState(state => {
    if (state === 'active') {
      syncPermissionState();
    }
  });

  // 화면 최초 진입 시 체크 (useAppState는 변경 이벤트만 감지)
  useEffect(() => {
    syncPermissionState();
  }, []);

  const handleValue =
    ({ name, value }: { name: string; value: boolean }) =>
    async () => {
      // 알림 설정을 켰을 때 시스템 알림이 꺼져 있을경우 설정으로 이동할 수 있는 Dialog 노출
      if (value) {
        const isGranted = await checkSystemPermission();
        if (!isGranted) {
          pendingToggleRef.current = { name, value };

          showDialog({
            type: 'ALERT',
            title: '기기 알람 설정 꺼짐',
            content: '현재 기기 알림이 꺼져 있습니다. 알림을 받으\n시려면 설정에서 허용해 주세요',
            alertButtonText: '설정으로 이동',
            handleAlertButton: () => {
              Linking.openSettings();
              hideDialog();
            },
          });

          return;
        }
      }

      updateNotificationSettings({ [name]: value });
      const {
        notificationSettings: { base, todoBot, feedback, marketing },
      } = useStore.getState();

      mutate({ baseAlarmYn: base, todoBotYn: todoBot, feedbackYn: feedback, marketingYn: marketing });
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
        isLast
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
});

export { Notification };
