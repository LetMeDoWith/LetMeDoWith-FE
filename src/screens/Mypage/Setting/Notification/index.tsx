import React from 'react';
import { StyleSheet, View } from 'react-native';

import { NotificationMenu } from 'components/Mypage/Setting/Menu';
import { theme } from 'styles/theme';

const Notification = () => (
  <View style={styles.container}>
    <NotificationMenu title="기본 알림" subTitle="시스템 알림, 공지사항 등 기본적인 알림입니다." />
    <NotificationMenu title="투두 알림봇" subTitle="시작 10분 전부터 발송되는 서포트 알림입니다." />
    <NotificationMenu title="잔소리 알림" subTitle="두윗러들이 실시간으로 보내는 잔소리 알림입니다." />
    <NotificationMenu title="마케팅&혜택 알림 " subTitle="다양한 소식과 혜택에 대한 알림입니다." />
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    borderTopWidth: 0.5,
    borderTopColor: theme.COLORS.DEFAULT.BLACK,
  },
});

export { Notification };
