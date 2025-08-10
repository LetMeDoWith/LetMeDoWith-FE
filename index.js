import 'react-native-gesture-handler';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');
import { LocaleConfig } from 'react-native-calendars/src';
LocaleConfig.locales.kr = {
  monthNames: ['01월', '02월', '03월', '04월', '05월', '06월', '07월', '08월', '09월', '10월', '11월', '12월'],
  monthNamesShort: ['01월', '02월', '03월', '04월', '05월', '06월', '07월', '08월', '09월', '10월', '11월', '12월'],
  dayNames: ['화요일', '수요일', '목요일', '금요일', '토요일', '일요일', '월요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};

LocaleConfig.defaultLocale = 'kr';

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
