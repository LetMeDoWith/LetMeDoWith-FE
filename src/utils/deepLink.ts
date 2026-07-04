import { getStateFromPath } from '@react-navigation/native';

import { navigationRef } from '../../App';

const DEEP_LINK_SCHEME = 'letmedowith://';

const linking = {
  prefixes: [DEEP_LINK_SCHEME],
  config: {
    screens: {
      HOME: {
        screens: {
          MYTODO: 'home',
          FEED: 'feed',
          MYPAGE: 'mypage',
        },
      },
      SETTING: {
        path: 'setting',
        screens: {
          DEFAULT: '',
          MYINFO: 'myinfo',
          NOTIFICATION: 'notification',
          NOTICE: 'notice',
          NOTICE_DETAIL: 'notice/detail',
          POLICY: 'policy',
          ACCOUNT: 'account',
          BADGE_INFO: 'badge',
        },
      },
      FEEDBACK: 'feedback',
      REALTIME_NAG: 'realtime-nag',
      MYINFO: 'myinfo',
      NOTIFICATION_LIST: 'notification',
      RECEIVED_FEEDBACK: 'received-feedback',
    },
  },
};

/**
 * 딥링크 URL을 파싱하여 앱 내부 네비게이션 수행
 * linking config를 기반으로 URL → navigation state 변환
 */
const navigateByDeepLink = (deepLink: string) => {
  if (!navigationRef.isReady()) {
    return;
  }

  const path = deepLink.replace(DEEP_LINK_SCHEME, '');
  const state = getStateFromPath(path, linking.config as Parameters<typeof getStateFromPath>[1]);

  if (!state?.routes.length) {
    return;
  }

  const route = state.routes[0];
  const screenParams = route.state?.routes?.[0]
    ? { screen: route.state.routes[0].name, params: route.state.routes[0].params }
    : route.params;

  navigationRef.navigate(route.name as never, screenParams as never);
};

export { linking, navigateByDeepLink };
