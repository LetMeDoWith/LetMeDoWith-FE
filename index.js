import 'react-native-gesture-handler';

import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

import { LocaleConfig } from 'react-native-calendars'; //
LocaleConfig.locales.ko = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'], // ✅ 순서 수정
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';

// 백그라운드 메세지 핸들러 재등록 방지
if (!__DEV__ || !global.__hasSetBGMessageHandler) {
  // 앱이 종료/백그라운드 상태일 때 메시지 핸들러 등록
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('[FCM][Background] message:', remoteMessage);
    // notifee 알림 처리
  });
  if (__DEV__) {
    global.__hasSetBGMessageHandler = true;
  }
}
AppRegistry.registerComponent(appName, () => App);
