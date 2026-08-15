# 내비게이션 / 딥링크 지침

## 구조

- 네비게이터는 `components/navigators/Stack/<도메인>/index.tsx`, `components/navigators/Tab/<도메인>/index.tsx`에 둔다.
- 화면 이름(라우트 키)은 **SCREAMING_SNAKE_CASE** (`REALTIME_NAG`, `NOTICE_DETAIL`).
- 모든 ParamList 타입은 **`types/shared/index.ts` 한 곳에** 정의한다. 네비게이터 파일에 로컬로 선언하지 않는다.

## 타입 규칙

- 스택/탭마다 `<이름>ParamList` + `<이름>ScreenProps<T>` 헬퍼를 쌍으로 정의한다:
  ```ts
  type SettingStackScreenProps<T extends keyof SettingStackParamList> = StackScreenProps<SettingStackParamList, T>;
  ```
  탭처럼 상위 스택으로도 이동하는 화면은 `CompositeScreenProps`로 합성한다(`HomeTabScreenProps` 참고).
- 중첩 네비게이터로 이동하는 라우트의 파라미터는 `NavigatorScreenParams<자식ParamList>`를 사용한다.
- `useNavigation`은 제네릭을 명시한다: `useNavigation<StackNavigationProp<RootStackParamList>>()`. 타입 없는 `useNavigation()` 금지.
- 파라미터는 최소한으로 유지한다. **화면 렌더에 필요한 데이터 전체를 파라미터로 넘기지 않는다** — id만 넘기고 화면에서 쿼리로 조회한다. 즉시 렌더용 보조 데이터(딥링크 진입 시엔 없을 수 있는 값)는 optional로 선언하고 주석으로 사유를 남긴다(`CHEER_COLLECTION.successImageUrl` 패턴).

## 새 화면 추가 절차 (누락 주의)

1. `types/shared/index.ts` — 해당 ParamList에 라우트·파라미터 추가
2. 화면 컴포넌트 작성 — `screens/<도메인>/.../index.tsx`
3. 네비게이터에 `<Screen name="..." component={...} options={{ headerTitle: '...' }} />` 등록
4. **딥링크 진입이 필요한 화면이면 `utils/deepLink.ts`의 `linking.config.screens`에 경로 추가** — 이 단계를 빠뜨리면 푸시 알림 딥링크가 동작하지 않는다. 경로는 kebab-case(`realtime-nag`)
5. 화면 이동 코드는 `navigation.navigate('이름', params)` — 문자열이 ParamList와 타입으로 검증되는지 확인

## 스타일 옵션

- 스택 공통 `screenOptions`는 기존 패턴을 따른다: `headerTitleAlign: 'center'`, `headerTitleStyle`에 `theme.TYPOGRAPHY.TITLE_1`, `headerShadowVisible: false`, `cardStyle` 배경 WHITE.
- 헤더 타이틀 등 텍스트·색상은 theme 토큰 사용(UI 지침 참조).

## 딥링크

- 스킴: `letmedowith://`. 딥링크 처리는 `utils/deepLink.ts`의 `navigateByDeepLink`가 담당하며, `navigationRef.isReady()` 가드를 유지한다.
- 딥링크 → 화면 이동 로직을 개별 화면·알림 코드에 중복 구현하지 않는다. 반드시 `linking` config + `navigateByDeepLink`를 거친다.
- 새 딥링크 경로를 추가하면 푸시 알림(FCM data)의 딥링크 값과 형식이 일치하는지 서버 스펙을 확인한다.

## 성능 관련 (성능 지침과 연동)

- 무거운 화면은 진입 시 `InteractionManager` 지연 마운트 패턴 적용.
- 탭(material-top-tabs 포함)은 `lazy` 옵션 활용, 탭 전환 시 스크롤 위치 유지가 필요하면 언마운트하지 않는다.
