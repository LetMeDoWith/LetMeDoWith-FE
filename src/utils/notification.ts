// services/notification.ts
import { AppState } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AuthorizationStatus } from '@notifee/react-native';

import { isAos } from 'utils/device';
import { useAuthStore } from 'stores/auth';
import { useAddNotificationToken } from 'hooks/queries/notification/useAddNotificationToken';

let initialized = false;
let unsubOnMessage: (() => void) | null = null;
let unsubOnTokenRefresh: (() => void) | null = null;
let appSubscribeState: ReturnType<typeof AppState.addEventListener> | null = null;

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
 *  - mutateNotificationToken: 알림(FCM) 토큰 등록 mutation
 *  - onForegroundMessage: Foreground에서 메시지를 받았을 때 실행되는 콜백
 *  - onTokenChanged: FCM 토큰이 최초 발급되거나 갱신될 때 실행되는 콜백
 */
const initNotificationLayer = async (options?: {
  mutateNotificationToken?: ReturnType<typeof useAddNotificationToken>['mutate'];
  onForegroundMessage?: (m: FirebaseMessagingTypes.RemoteMessage) => Promise<void> | void;
  onTokenChanged?: (token: string) => Promise<void> | void; // 서버 동기화 콜백
}) => {
  const {
    isNeedSignUp,
    actions: { setIsNeedSignUp },
  } = useAuthStore.getState();

  // 이미 초기화되어 있으면 스킵
  if (initialized) {
    return;
  }

  const onMessage = options?.onForegroundMessage ?? (async () => {});
  const onTokenChanged = options?.onTokenChanged ?? (async () => {});

  // 현재 권한 확인
  const currentSetting = await notifee.getNotificationSettings();
  let authorized = currentSetting.authorizationStatus >= AuthorizationStatus.AUTHORIZED;

  // 권한 요청이 허용되지 않은 상태일 때 권한 요청
  if (!authorized) {
    const res = await notifee.requestPermission();
    authorized = res.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
    if (!authorized) {
      // 회원가입 진행중일 경우 값 OFF
      if (isNeedSignUp) {
        setIsNeedSignUp(false);
      }
      // 권한 요청을 거부하면 초기화 미수행 하고 포그라운드 복귀 감시로 재시도 함. initialized 값 수정 x
      ensurePermissionWatcher(options); // 설정에서 바꾸고 돌아오면 재시도
      return;
    }
  }

  // 권한이 허용이라면 초기화 수행
  // iOS: 원격 알림 등록
  if (!isAos) {
    await messaging().registerDeviceForRemoteMessages();
  }

  // Android: 채널 보장
  if (isAos) {
    await notifee.createChannel({
      id: 'default',
      name: 'Default',
      importance: AndroidImportance.DEFAULT,
    });
  }

  // 최초 토큰 확보 & 서버 동기화(변경시에만 처리하도록 onTokenChanged 내부에서 분기)
  try {
    const token = await messaging().getToken();
    await onTokenChanged(token);
    if (options?.mutateNotificationToken) {
      options.mutateNotificationToken({ notificationToken: token });
    }
  } catch (e) {
    console.log('FCM 토큰을 가져오는 데 실패했습니다.');
  }

  // 포그라운드 수신(1회 등록)
  unsubOnMessage = messaging().onMessage(async message => {
    await onMessage(message);
  });

  // 토큰 갱신(1회 등록)
  unsubOnTokenRefresh = messaging().onTokenRefresh(async newToken => {
    await onTokenChanged(newToken);
  });

  setIsNeedSignUp(false);
  initialized = true;

  // 권한 감시 리스너는 더 이상 불필요하면 제거
  if (appSubscribeState) {
    appSubscribeState.remove();
    appSubscribeState = null;
  }
};

/**
 * 권한이 거부된 상태에서 앱이 Foreground로 복귀했을 때,
 * 다시 권한 상태를 체크하여 허용으로 변경되면 initNotificationLayer를 재호출한다.
 *
 * - initialized 상태가 true라면 이미 초기화된 것이므로 무시한다.
 * - 중복 등록을 막기 위해 appSubscribeState가 존재하면 재등록하지 않는다.
 *
 * @param options initNotificationLayer와 동일한 콜백 옵션
 */
const ensurePermissionWatcher = (options?: Parameters<typeof initNotificationLayer>[0]) => {
  if (appSubscribeState) {
    return;
  }

  appSubscribeState = AppState.addEventListener('change', async state => {
    if (state !== 'active' || initialized) {
      return;
    }
    const settings = await notifee.getNotificationSettings();
    const authorized = settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
    if (authorized) {
      // 권한 허용으로 바뀌었으면 초기화 재시도
      await initNotificationLayer(options);
    }
  });
};

/**
 * 알림 레이어를 해제(dispose)한다.
 *
 * - messaging().onMessage / onTokenRefresh 리스너 해제
 * - AppState 구독 해제
 * - 내부 플래그(initialized)를 false로 초기화
 *
 * 주로 로그아웃 시점, 또는 알림 기능을 완전히 종료해야 할 때 호출한다.
 */
const disposeNotificationLayer = () => {
  unsubOnMessage?.();
  unsubOnMessage = null;
  unsubOnTokenRefresh?.();
  unsubOnTokenRefresh = null;
  if (appSubscribeState) {
    appSubscribeState.remove();
    appSubscribeState = null;
  }
  initialized = false;
};

export { initNotificationLayer, ensurePermissionWatcher, disposeNotificationLayer };
