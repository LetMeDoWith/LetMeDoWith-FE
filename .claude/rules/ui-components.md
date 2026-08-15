# UI 컴포넌트 / 디자인 시스템 지침

원칙: **새 UI를 만들기 전에 `components/common/`에 같은 역할의 컴포넌트가 있는지 먼저 확인한다.** 이미 있는 것과 유사한 다이얼로그·시트·인풋을 새로 만들지 않는다.

## theme 토큰 (`styles/theme.ts`)

- 색상·타이포그래피는 **반드시 `theme` 토큰**을 사용한다. hex 하드코딩 금지. 토큰에 없는 색이 디자인에 등장하면 임의 hex를 쓰지 말고 `theme.COLORS`에 토큰을 추가한 뒤 사용한다.
- 색상 체계: `PRIMARY`(브랜드 레드), `SECONDARY`(블루), `STATUS`(GREEN/YELLOW/RED — 상태 표시), `GRAY_SCALE`(GRAY_98~10, 숫자가 클수록 밝음), `SUB`, `DEFAULT`(WHITE/BLACK).
- 텍스트는 `theme.TYPOGRAPHY`의 프리셋(HEADER, TITLE_1/2, BODY_1/2 …)을 기반으로 하고, 색만 바꿀 때는 스프레드로 확장한다:
  ```ts
  moreButtonText: {
    ...theme.TYPOGRAPHY.BODY_1,
    color: theme.COLORS.GRAY_SCALE.GRAY_40,
  },
  ```
  fontSize·fontWeight를 개별 하드코딩하지 않는다.

## 전역 UI 패턴 (반드시 기존 것 사용)

| 용도                 | 사용법                                        | 비고                                                                                                      |
| -------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 확인/알림 다이얼로그 | `const { showDialog } = useDialog()`          | `type: 'BASIC' \| 'ALERT'`. Provider는 App.tsx에 이미 있음                                                |
| 토스트/스낵바        | `showSnackbar(message, { type })`             | 컴포넌트 밖에서도 호출 가능. `SNACKBAR_TYPE` 사용                                                         |
| 바텀시트             | `components/common/BottomSheet` (ref 방식)    | @gorhom 기반. 새 시트는 이 래퍼로 작성. 시트 안에 가로 스크롤이 있으면 `enableContentPanningGesture` 끄기 |
| 전역 로딩            | `LoadingOverlay` + `runWithSuppressedOverlay` | 자체 로딩 UI가 있는 refetch는 오버레이 억제                                                               |
| 확인 모달            | `components/common/Modal/ConfirmModal`        |                                                                                                           |
| 화면 헤더            | `components/common/Header` (+ `BackButton`)   | 네비게이터 headerTitle 옵션과 혼용하지 말 것 — 해당 스택의 기존 방식을 따른다                             |
| 당겨서 새로고침      | `components/common/PullToRefreshControl`      |                                                                                                           |
| 날짜/시간 선택       | `components/common/DateTimePicker`            |                                                                                                           |
| 입력 필드            | `components/common/Input`                     |                                                                                                           |

- RN 기본 `Alert`를 새로 도입하지 않는다 — 다이얼로그는 `useDialog`, 알림성 메시지는 스낵바.

## 컴포넌트 작성 규칙

- 폴더 구조: `components/<도메인>/<컴포넌트명>/index.tsx`. 도메인에 종속되지 않으면 `components/common/`.
- Props는 `interface Props { ... }`로 선언하고 구조 분해로 받는다. 선택 prop에는 목적 주석(왜 필요한지)을 단다.
- 부모 제어가 필요한 컴포넌트(시트 등)는 `forwardRef` + `useImperativeHandle` 패턴(기존 `BottomSheet` 참고).
- 조건부 렌더는 로딩/빈 상태/정상 3분기를 명시적으로 처리한다(`FeedNagList`의 `isLoading` → 빈 목록 → 목록 패턴).
- 재사용 컴포넌트에 특정 화면의 비즈니스 로직(쿼리 호출·내비게이션)을 넣지 않는다 — 콜백 prop으로 위임한다.

## SVG 아이콘

- 아이콘은 `components/common/icons/<이름>/index.tsx`에 SVG 컴포넌트로 작성한다. 이미지 파일(png) 아이콘을 새로 추가하지 않는다.
- 표준 시그니처(기존 `Thunder` 패턴):
  ```tsx
  const Thunder = ({
    width = 16,
    height = 16,
    fill = theme.COLORS.GRAY_SCALE.GRAY_40,
  }: Pick<SvgProps, 'width' | 'height'> & { fill?: string }) => ( ... );
  ```
  기본 크기·기본 색(theme 토큰)을 지정하고, `viewBox`는 원본 유지.
- 같은 모양·다른 색 아이콘을 별도 컴포넌트로 복제하지 않는다 — `fill` prop으로 처리한다.
- 화면에 svg 파일을 직접 import하는 방식(react-native-svg-transformer)도 가능하지만, 재사용 아이콘은 컴포넌트로 만든다.
