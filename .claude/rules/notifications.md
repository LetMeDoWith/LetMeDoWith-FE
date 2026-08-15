# 알림 (FCM + notifee) 지침

알림 관련 로직은 **전부 `utils/notification.ts`에 모여 있다.** FCM 수신·표시·클릭 처리·권한·토큰 로직을 화면이나 다른 훅에 분산 구현하지 않는다.

## 구조 원칙

- `messaging()`(FCM)은 **수신/토큰**, `notifee`는 **표시/클릭 이벤트/권한** 담당. 역할을 섞지 않는다.
- 초기화는 모듈 레벨 플래그(`initialized`/`initializing`)로 **1회만** 실행되는 싱글턴 패턴을 유지한다. 구독 해제 함수(`unsubXxx`)는 모듈 변수로 보관하고 재초기화 전에 반드시 해제한다 — 중복 구독되면 알림이 두 번 표시된다.
- Android 채널은 `CHANNEL_ID = 'default'` 하나를 사용하며 `createNotificationChannel`로 1회 생성(`channelCreated` 가드). 새 채널이 필요하면 임의 생성하지 말고 채널 전략을 먼저 논의한다.
- 플랫폼 분기는 `utils/device`의 `isAos` 등을 사용한다. `Platform.OS` 직접 비교를 새로 퍼뜨리지 않는다.

## 메시지 표시 규칙

- Foreground/Background 수신 메시지는 `displayNotification`으로 notifee 로컬 알림으로 변환해 표시한다. 제목/본문 fallback(`'새 알림'`)을 유지한다.
- 이미지는 `extractImageUrl`을 거친다 — 플랫폼별 위치가 다르다(Android: `notification.android.imageUrl`, iOS: `data.fcm_options.image`, 공통: `notification.image`). 새 코드에서 특정 플랫폼 경로만 읽지 않는다.
- Android `smallIcon`은 `ic_stat_notification` 고정(네이티브 리소스). 변경 시 android 리소스도 함께 수정해야 한다.

## 클릭 → 딥링크

- 알림 클릭 시 화면 이동은 FCM data의 딥링크 값을 `navigateByDeepLink`(내비게이션 지침 참조)로 넘기는 경로 하나로 통일한다. 알림 핸들러에서 `navigation.navigate`를 직접 호출하지 않는다.
- 앱이 종료 상태(quit)에서 알림으로 실행되는 케이스는 `navigationRef.isReady()` 이후에 처리되도록 기존 흐름을 유지한다.

## 권한·설정 동기화

- 권한 확인은 `checkSystemPermission`(notifee `AuthorizationStatus >= AUTHORIZED`) 사용.
- 시스템 권한이 바뀌면 `syncNotificationSettings`로 **서버 설정 + zustand `notificationSettings`를 함께** 갱신한다. 한쪽만 갱신하는 코드를 만들지 않는다. 단, 마케팅 수신 동의(`marketingYn`)는 시스템 권한과 무관한 사용자의 명시적 선택이므로 권한 허용 시에도 기존 값을 보존한다.
- FCM 토큰 등록은 `NOTIFICATION_API.ADD_TOKEN` 경유, 토큰 갱신은 `onTokenRefresh` 구독으로 처리한다.

## 테스트/디버깅 주의

- 알림 동작은 시뮬레이터에서 제약이 크다(iOS 시뮬레이터는 원격 푸시 불가). 실기기 확인이 필요한 변경은 보고에 명시한다.
- `.env`·네이티브 리소스(채널, 아이콘)를 건드린 경우 Metro reload로는 반영되지 않는다 — 재빌드 필요(개발 환경 지침 참조).
