import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { theme } from 'styles/theme';
import { Setting } from 'screens/Mypage/Setting';
import { Myinfo } from 'screens/Mypage/Setting/Myinfo';
import { Notification } from 'screens/Mypage/Setting/Notification';
import { Policy } from 'screens/Mypage/Setting/Policy';
import { BadgeInfo } from 'screens/Mypage/Setting/BadgeInfo';
import { NoticeDetail, NoticeList } from 'screens/Mypage/Setting/Notice';
import { Account } from 'screens/Mypage/Setting/Account';
import type { SettingStackParamList } from 'types/shared';
import { withScreenErrorBoundary } from 'components/common/ScreenErrorBoundary';

/* 화면 렌더 에러·핵심 데이터 첫 로딩 실패 시 내용 자리를 에러 화면으로 바꾼다(헤더·탭바는 유지) */
const SettingScreen = withScreenErrorBoundary(Setting);
const MyinfoScreen = withScreenErrorBoundary(Myinfo);
const NotificationScreen = withScreenErrorBoundary(Notification);
const NoticeListScreen = withScreenErrorBoundary(NoticeList);
const NoticeDetailScreen = withScreenErrorBoundary(NoticeDetail);
const PolicyScreen = withScreenErrorBoundary(Policy);
const AccountScreen = withScreenErrorBoundary(Account);
const BadgeInfoScreen = withScreenErrorBoundary(BadgeInfo);

const SettingStackNavigator = () => {
  const { Navigator, Screen } = createStackNavigator<SettingStackParamList>();
  return (
    <Navigator
      initialRouteName="DEFAULT"
      screenOptions={{
        headerTitleAlign: 'center',
        headerTitleStyle: { ...theme.TYPOGRAPHY.TITLE_1 },
        headerBackTitleVisible: false,
        headerTintColor: theme.COLORS.DEFAULT.BLACK,
        headerShadowVisible: false,
        cardStyle: { backgroundColor: theme.COLORS.DEFAULT.WHITE },
      }}
    >
      <Screen name="DEFAULT" component={SettingScreen} options={{ headerTitle: '설정' }} />
      <Screen name="MYINFO" component={MyinfoScreen} options={{ headerTitle: '내 정보 관리' }} />
      <Screen name="NOTIFICATION" component={NotificationScreen} options={{ headerTitle: '알림설정' }} />
      <Screen name="NOTICE" component={NoticeListScreen} options={{ headerTitle: '이벤트 & 공지사항' }} />
      <Screen name="NOTICE_DETAIL" component={NoticeDetailScreen} options={{ headerTitle: '이벤트 & 공지사항' }} />
      <Screen name="POLICY" component={PolicyScreen} options={{ headerTitle: '이용약관' }} />
      <Screen name="ACCOUNT" component={AccountScreen} options={{ headerTitle: '계정관리' }} />
      <Screen name="BADGE_INFO" component={BadgeInfoScreen} options={{ headerTitle: '보유한 뱃지' }} />
    </Navigator>
  );
};

export { SettingStackNavigator };
