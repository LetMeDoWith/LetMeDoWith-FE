# React Native 성능 최적화 지침

이 프로젝트(RN 0.73, 구 아키텍처)에서 컴포넌트·화면을 작성/수정할 때 따르는 성능 규칙.
원칙: **측정 없이 추측으로 최적화하지 않되, 아래의 검증된 기본 패턴은 처음부터 지킨다.**

## 1. 리렌더 최소화

- **zustand는 selector로 구독한다.** 스토어 전체 구독 금지.

  ```ts
  /* Bad — 스토어의 아무 값이나 바뀌면 리렌더 */
  const { isLoggedIn } = useStore();

  /* Good — 해당 값이 바뀔 때만 리렌더 */
  const isLoggedIn = useStore(state => state.isLoggedIn);
  ```

- actions는 `xxxActions` 객체 하나로 selector 구독한다(참조가 고정이라 리렌더 없음).
- **react-query는 `select`로 필요한 조각만 구독한다.** 큰 응답에서 일부만 쓰는 컴포넌트는 `select`로 잘라서 그 조각이 바뀔 때만 리렌더되게 한다.
- `React.memo`는 다음 조건에서 적용한다: (1) 리스트 아이템, (2) 부모가 자주 리렌더되는 무거운 자식(SVG 다수·애니메이션 포함). 단순 정적 컴포넌트에 습관적으로 붙이지 않는다.
- `memo`된 컴포넌트에 넘기는 콜백/객체 prop은 `useCallback`/`useMemo`로 참조를 고정한다. 고정하지 않으면 `memo`가 무력화된다.
- Context 값으로 매 렌더 새 객체를 만들지 않는다(`useMemo`로 감싸기).

## 2. 리스트 (FlatList)

- **`renderItem`은 반드시 `useCallback`으로 메모이제이션**하고, 아이템 컴포넌트는 `React.memo`를 적용한다.
- `keyExtractor`는 서버 id 사용 (`item => item.id.toString()`). index를 key로 쓰지 않는다.
- 아이템이 무거운 리스트(쿼리 훅·애니메이션 포함)는 프로젝트 표준 프리셋을 사용한다:

  ```tsx
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={10}
  updateCellsBatchingPeriod={50}
  removeClippedSubviews
  ```

- 무한 스크롤은 `onEndReached` + `hasNextPage && !isFetchingNextPage` 가드 패턴을 따른다 (`src/screens/Feed/RealtimeNag/index.tsx` 참고).
- 아이템 높이가 고정이면 `getItemLayout`을 제공한다.
- ScrollView 안에 항목을 map으로 펼치는 것은 소수(약 5개 이하) 고정 개수일 때만 허용 (`FeedNagList`의 `DISPLAY_COUNT` 패턴). 그 이상은 FlatList.

## 3. 화면 전환 / 내비게이션

- **전환 애니메이션 중 무거운 렌더 금지.** 진입 시 렌더 비용이 큰 화면(무거운 리스트 등)은 `InteractionManager.runAfterInteractions`로 전환 종료 후 마운트하고, 그동안 `ActivityIndicator`를 보여준다:

  ```tsx
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => setIsReady(true));
    return () => task.cancel();
  }, []);
  ```

- 탭 화면(material-top-tabs 포함)은 `lazy` 옵션으로 방문 시점에 렌더한다.
- 화면 마운트 직후 동기적으로 무거운 계산을 하지 않는다. 필요하면 `useMemo` + 지연 마운트로 나눈다.
- 탭 전환 시 스크롤 위치 유지가 필요한 리스트는 언마운트하지 말고 유지한다(재마운트가 더 비싸다).

## 4. 애니메이션 (reanimated 3)

- 애니메이션은 reanimated로 작성하고 **UI 스레드에서 완결**시킨다: `useSharedValue` + `useAnimatedStyle` + `withTiming`/`withSpring`.
- shared value 변경으로 처리할 수 있는 것을 React state로 처리하지 않는다(리렌더 유발 금지).
- worklet에서 JS 함수 호출이 필요할 때만 `runOnJS`를 쓰고, 프레임마다 호출되지 않게 한다.
- `useAnimatedStyle` 안에서 새 객체/배열 생성 외의 무거운 계산을 하지 않는다.
- RN 기본 `Animated`를 새로 쓰지 않는다(기존 코드 수정 시에도 가능하면 reanimated로).

## 5. 이미지

- 네트워크 이미지는 **FastImage**를 사용한다(RN `Image` 금지). 프로필·피드 이미지 등 반복 노출 이미지는 캐시 이점이 크다.
- 이미지에는 항상 명시적 크기(style width/height)를 지정한다.
- 리스트 아이템의 이미지는 표시 크기에 맞는 썸네일 URL을 우선 사용한다(원본 로드 금지).
- 정적 아이콘은 SVG 컴포넌트(`components/common/icons/`)를 사용하고, 같은 SVG를 리스트에서 반복 렌더할 때는 아이템 `memo`로 재생성을 막는다.

## 6. 스타일 / 렌더 구조

- 스타일은 파일 하단 `StyleSheet.create`로 정의한다. **렌더마다 새로 만들어지는 인라인 스타일 객체 금지** (동적 값 결합은 `[styles.base, { height }]` 형태만 허용).
- JSX에 인라인 화살표 함수를 남발하지 않는다 — 특히 `memo`된 자식과 리스트 아이템에 넘길 때는 `useCallback` 필수. 일반 `Pressable onPress` 등 memo 안 된 자식은 무방.
- 컴포넌트 내부에서 컴포넌트를 정의하지 않는다(매 렌더 재마운트 발생).
- 불필요한 `View` 중첩을 줄인다. 레이아웃 목적이 없으면 Fragment 사용.

## 7. 데이터 페칭 / JS 스레드

- 로딩 UX: 전역 오버레이가 스크롤 페칭까지 덮지 않도록, 백그라운드성 페칭은 `runWithSuppressedOverlay` 패턴을 사용한다.
- mutation 후 무효화는 필요한 쿼리 키만 대상으로 한다(`constants/queries`의 키 사용, 광범위 invalidate 금지).
- 렌더 경로에서 `dayjs` 파싱·포맷 등 반복 계산은 `useMemo` 또는 모듈 레벨 캐시(`utils/feedbackSvgCache.ts` 패턴)로 줄인다.
- `console.log`를 렌더/스크롤 경로에 남기지 않는다(릴리즈 성능 저하).

## 8. 측정 원칙

- "느리다"는 이슈는 먼저 원인을 측정한다: React DevTools Profiler(리렌더 횟수/원인), Perf Monitor(JS/UI FPS).
- 최적화 커밋은 `perf:` 타입으로, 커밋 본문에 원인과 조치를 기록한다(기존 커밋 스타일 참고).
- 위 기본 패턴 외의 추가 최적화(가상화 튜닝, 지연 마운트 등)는 측정으로 병목이 확인된 경우에만 적용한다.
