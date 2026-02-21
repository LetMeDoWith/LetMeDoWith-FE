import { AppStateStatus } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AuthorizationStatus } from '@notifee/react-native';
import { AndroidVisibility } from '@notifee/react-native/src/types/NotificationAndroid';

import { isAos } from 'utils/device';
import { useStore } from 'stores/index';
import { updateNotificationSettings as mutateNotificationSettings } from 'services/rest/member';

let initialized = false;
let channelCreated = false;
let unsubOnMessage: (() => void) | null = null;
let unsubOnTokenRefresh: (() => void) | null = null;
let unsubAppState: (() => void) | null = null;

const CHANNEL_ID = 'default';

/**
 * 시스템 알림 권한 허용 여부를 확인하는 함수
 * - AUTHORIZED 이상인 경우 true 반환
 * - DENIED / NOT_DETERMINED 인 경우 false 반환
 */
const checkSystemPermission = async (): Promise<boolean> => {
  const settings = await notifee.getNotificationSettings();
  return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
};

/**
 * 알림 설정을 서버와 FE 상태에 동기화하는 함수
 */
const syncNotificationSettings = async (authorized: boolean) => {
  const {
    notificationSettings,
    notificationActions: { updateNotificationSettings },
  } = useStore.getState();

  const settings = authorized
    ? {
        baseAlarmYn: true,
        todoBotYn: true,
        feedbackYn: true,
        marketingYn: notificationSettings.marketing,
      }
    : {
        baseAlarmYn: false,
        todoBotYn: false,
        feedbackYn: false,
        marketingYn: false,
      };

  try {
    await mutateNotificationSettings(settings);
    updateNotificationSettings({
      base: settings.baseAlarmYn,
      todoBot: settings.todoBotYn,
      feedback: settings.feedbackYn,
      marketing: settings.marketingYn,
    });

    console.log('✅[syncNotificationSettings] 알림 설정 동기화 완료:', settings);
  } catch (error) {
    console.error('❌[syncNotificationSettings] 알림 설정 동기화 실패:', error);
  }
};

/**
 * 알림 채널 생성 (한 번만 실행)
 */
const createNotificationChannel = async () => {
  if (!isAos || channelCreated) {
    return CHANNEL_ID;
  }

  const channelId = await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
    vibration: true,
  });

  channelCreated = true;
  console.log('✅ 채널 생성 완료:', channelId);
  return channelId;
};

/**
 * Foreground/Background에서 수신한 FCM 메시지를 notifee를 사용하여 로컬 알림으로 표시
 */
const displayNotification = async (message: FirebaseMessagingTypes.RemoteMessage) => {
  try {
    const imageUrl = message.notification?.image || (message.data?.imageUrl as string | undefined);

    await notifee.displayNotification({
      title: message.notification?.title || '새 알림',
      body: message.notification?.body || '',
      android: {
        channelId: CHANNEL_ID,
        smallIcon: 'ic_launcher',
        ...(imageUrl && {
          largeIcon: imageUrl,
        }),
        importance: AndroidImportance.HIGH,
        vibrationPattern: [300, 500],
        visibility: AndroidVisibility.PUBLIC,
        pressAction: {
          id: 'default',
        },
        timestamp: Date.now(),
        showTimestamp: true,
      },
      ...(imageUrl && {
        ios: {
          attachments: [{ url: imageUrl }],
        },
      }),
      data: message.data,
    });
  } catch (error) {
    console.error('❌ 알림 표시 실패:', error);
  }
};

/**
 * Background 메시지 핸들러
 */
const handleBackgroundMessage = async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
  console.log('[FCM][BG] 백그라운드 메시지 수신:', remoteMessage);

  // Background에서도 채널이 필요하므로 생성
  await createNotificationChannel();
  await displayNotification(remoteMessage);
};

/**
 * 초기화 진입점: FCM/Notifee 권한을 확인 및 요청하고,
 * 토큰을 확보/동기화하며 메시지 리스너를 1회 등록한다.
 *
 * - 권한이 없는 경우: 권한 요청 → 거부 시 초기화는 수행하지 않고,
 *   AppState('active') 이벤트를 감시하도록 ensurePermissionWatcher를 등록한다.
 * - 권한이 허용된 경우: iOS는 registerDeviceForRemoteMessages,
 *   Android는 기본 채널을 생성한다.
 * - 이후 FCM 토큰을 getToken()으로 확보하여 서버에 동기화 콜백을 호출한다.
 *
 * @param options 콜백 핸들러 모음
 *  - onForegroundMessage: Foreground에서 메시지를 받았을 때 실행되는 콜백
 *  - onTokenChanged: FCM 토큰이 최초 발급되거나 갱신될 때 실행되는 콜백 (서버 동기화)
 *  - subscribeAppState: AppStateProvider의 subscribe 함수 (AppState 구독용)
 */
const initNotificationLayer = async (options?: {
  onForegroundMessage?: (m: FirebaseMessagingTypes.RemoteMessage) => Promise<void> | void;
  onTokenChanged?: (token: string) => Promise<void> | void;
  subscribeAppState?: (callback: (state: AppStateStatus) => void) => () => void;
}) => {
  console.log('🚀 [initNotificationLayer] 시작');

  // 이미 초기화되어 있으면 스킵
  if (initialized) {
    console.log('⚠️ [initNotificationLayer] 이미 초기화됨, 스킵');
    return;
  }

  const onMessage = options?.onForegroundMessage ?? (async () => {});
  const onTokenChanged = options?.onTokenChanged ?? (async () => {});

  // 현재 권한 확인
  console.log('🔐 [initNotificationLayer] 권한 확인 중...');
  const currentSetting = await notifee.getNotificationSettings();
  let authorized = await checkSystemPermission();
  console.log('[initNotificationLayer] 현재 권한 상태:', currentSetting.authorizationStatus, '허용됨:', authorized);

  // 이미 알림 설정이 거부된 경우
  if (currentSetting.authorizationStatus === AuthorizationStatus.DENIED) {
    console.log('❌ [initNotificationLayer] 권한이 이미 거부됨');

    // 권한 watcher 등록
    if (!unsubAppState) {
      console.log('👀 [initNotificationLayer] 권한 watcher 등록');
      ensurePermissionWatcher(options);
    }
    return;
  }

  console.log('🙏 [initNotificationLayer] 권한 요청 중...');
  const res = await notifee.requestPermission();
  authorized = res.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
  console.log('[initNotificationLayer] 권한 요청 결과:', res.authorizationStatus, '허용됨:', authorized);

  if (!authorized) {
    console.log('❌ [initNotificationLayer] 권한 거부됨');
    await syncNotificationSettings(false);

    // watcher 등록 전에 체크 (이미 구독 중이면 중복 등록 방지)
    if (!unsubAppState) {
      console.log('👀 [initNotificationLayer] 권한 watcher 등록');
      ensurePermissionWatcher(options);
    } else {
      console.log('⚠️ [initNotificationLayer] 권한 watcher 이미 등록됨, SKIP');
    }

    return;
  }

  console.log('✅ [initNotificationLayer] 권한 확인 완료');
  await syncNotificationSettings(true);

  // iOS: 원격 알림 등록
  if (!isAos) {
    console.log('📱 [initNotificationLayer] iOS 원격 알림 등록 중...');
    await messaging().registerDeviceForRemoteMessages();
  }

  // AOS: 채널 생성
  await createNotificationChannel();

  // FCM 토큰 확보 & 서버 동기화(변경시에만 처리하도록 onTokenChanged 내부에서 분기)
  try {
    console.log('🔑 [initNotificationLayer] FCM 토큰 확보 중...');
    const token = await messaging().getToken();
    console.log('✅ [initNotificationLayer] FCM 토큰 확보 완료');
    await onTokenChanged(token);
  } catch (e) {
    console.error('❌ [initNotificationLayer] FCM 토큰 확보 실패:', e);
  }

  // 포그라운드 메시지 리스너
  console.log('👂 [initNotificationLayer] Foreground 리스너 등록 중...');
  unsubOnMessage = messaging().onMessage(async message => {
    console.log('[FCM][FG] 메시지 수신:', message);
    await onMessage(message);
    await displayNotification(message);
  });

  // 토큰 갱신 리스너
  console.log('🔄 [initNotificationLayer] 토큰 갱신 리스너 등록 중...');
  unsubOnTokenRefresh = messaging().onTokenRefresh(async newToken => {
    console.log('[FCM] 토큰 갱신:', newToken);
    await onTokenChanged(newToken);
  });

  initialized = true;
  console.log('🎉 [initNotificationLayer] 초기화 완료!');

  // 기존 watcher를 제거하고, 권한 변경 감시 watcher를 재등록
  if (unsubAppState) {
    console.log('🔄 [initNotificationLayer] 기존 watcher 제거 후 재등록');
    unsubAppState();
    unsubAppState = null;
  }
  ensurePermissionWatcher(options);
};

/**
 * 앱이 Foreground로 복귀할 때마다 시스템 알림 권한 상태를 체크하여
 * 앱 상태와 동기화하는 단일 watcher.
 *
 * - denied → granted: initNotificationLayer를 재호출하여 알림 레이어를 초기화한다.
 * - granted → denied: 알림 설정을 모두 false로 동기화하고 리스너를 해제한다.
 *
 * @param options initNotificationLayer와 동일한 콜백 옵션
 */
const ensurePermissionWatcher = (options?: Parameters<typeof initNotificationLayer>[0]) => {
  console.log('👀 [ensurePermissionWatcher] 호출됨');

  const subscribeAppState = options?.subscribeAppState;

  // subscribeAppState가 없으면 경고 (AppStateProvider 밖에서 호출된 경우)
  if (!subscribeAppState) {
    console.warn('⚠️ [ensurePermissionWatcher] subscribeAppState가 제공되지 않았습니다.');
    return;
  }

  console.log('✅ [ensurePermissionWatcher] AppState 구독 등록');

  // AppStateProvider의 subscribe 함수를 사용하여 AppState 구독
  unsubAppState = subscribeAppState(async state => {
    console.log('📱 [ensurePermissionWatcher] AppState 변경:', state);

    // active 상태가 아니면 스킵
    if (state !== 'active') {
      console.log('⚠️ [ensurePermissionWatcher] active 아님, 스킵');
      return;
    }

    const authorized = await checkSystemPermission();

    if (authorized && !initialized) {
      // denied → granted: 재초기화
      console.log('✅ [ensurePermissionWatcher] 권한 허용됨, 초기화 재시도');
      await initNotificationLayer(options);
    } else if (!authorized && initialized) {
      // granted → denied: 설정 동기화 및 리스너 해제
      console.log('🔔 [ensurePermissionWatcher] 시스템 알림 권한이 거부됨, 설정 동기화');
      await syncNotificationSettings(false);

      unsubOnMessage?.();
      unsubOnMessage = null;
      unsubOnTokenRefresh?.();
      unsubOnTokenRefresh = null;
      initialized = false;
      channelCreated = false;
    }
  });
};

/**
 * 알림 레이어를 해제(dispose)한다.
 *
 * - messaging().onMessage / onTokenRefresh 리스너 해제
 * - AppState 구독 해제 (unsubAppState 실행)
 * - 내부 플래그(initialized)를 false로 초기화
 *
 * 주로 로그아웃 시점, 또는 알림 기능을 완전히 종료해야 할 때 호출한다.
 */
const disposeNotificationLayer = () => {
  console.log('🗑️ [disposeNotificationLayer] 시작');

  unsubOnMessage?.();
  unsubOnMessage = null;
  unsubOnTokenRefresh?.();
  unsubOnTokenRefresh = null;

  // AppState 구독 해제
  if (unsubAppState) {
    console.log('🗑️ [disposeNotificationLayer] AppState 구독 해제');
    unsubAppState();
    unsubAppState = null;
  }

  initialized = false;
  channelCreated = false;

  console.log('✅ [disposeNotificationLayer] 완료');
};

export {
  initNotificationLayer,
  ensurePermissionWatcher,
  disposeNotificationLayer,
  handleBackgroundMessage,
  checkSystemPermission,
};
