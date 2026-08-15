# LetMeDoWith

같이 할 일을 인증하고 서로 잔소리(피드백)를 주고받는 소셜 투두 앱. React Native CLI 기반(iOS/Android).

## 기술 스택

- **React Native 0.73.3** (구 아키텍처) + TypeScript 5.0, React 18.2
- **상태 관리**: zustand(클라이언트) + @tanstack/react-query v5(서버)
- **폼/검증**: react-hook-form + zod
- **애니메이션**: react-native-reanimated 3
- **내비게이션**: react-navigation 6 (stack / bottom-tabs / material-top-tabs)
- **이미지**: react-native-fast-image
- **네트워크**: axios (`services/apiClient.ts`), 인증 토큰은 encrypted-storage

## 주요 명령어

```bash
yarn start            # Metro 실행
yarn ios / yarn android
yarn lint             # eslint
yarn test             # jest
npx prettier --write <files>
```

## 디렉토리 구조 (src/)

- `components/` — 도메인별 컴포넌트(Feed, Task, Mypage, Login …) + `common/`(공용) + `navigators/`
- `screens/` — 화면 단위 컴포넌트 (도메인별 하위 구조)
- `hooks/queries/<도메인>/` — react-query 훅 (`useFetchX`, `useAddX`, `useUpdateX` 네이밍)
- `services/` — apiClient, queryClient, `rest/`(API 함수), urls
- `stores/` — zustand slice (`<도메인>/slice.ts`, actions는 `xxxActions` 객체로 묶음)
- `schemes/` — zod 스킴, `types/` — 타입 정의, `constants/` — 상수(쿼리 키 등)
- `styles/theme.ts` — 색상/타이포그래피 토큰 (`theme.COLORS`, `theme.TYPOGRAPHY`)

## 코드 컨벤션

- import는 경로 별칭 사용: `components/*`, `hooks/*`, `stores/*` 등 (상대 경로 지양)
- 컴포넌트/훅은 named export: `export { FeedNagList };`
- 스타일은 파일 하단 `StyleSheet.create`, 색상·타이포는 반드시 `theme` 토큰 사용
- 여러 줄 설명 주석은 `//` 대신 `/* */` 블록 사용
- 제네릭을 최대한 활용해 타입을 명시 (react-query 훅의 명시적 제네릭 참고)
- 커밋 메시지는 한국어, `type: 요약` 형식 (feat/fix/perf/style/chore …), Co-Authored-By 넣지 않음
- 작업 완료 후 항상 prettier와 eslint 실행

## Git 규칙 (중요)

- **사용자의 명시적 지시가 있기 전까지 절대 커밋·푸시하지 않는다.** 작업이 끝나면 변경 사항을 워킹 트리에 남겨둔 채 보고만 한다. 서브에이전트도 동일하게 적용된다.
- `git add`도 커밋 지시가 떨어진 뒤에 한다. 브랜치 생성·전환, reset·revert 등 이력을 바꾸는 작업도 모두 지시가 있을 때만 수행한다.

## 지침 문서

세부 지침은 `.claude/rules/`에 있으며 세션 시작 시 자동 로드된다.

- `react-native-performance.md` — RN 렌더링·리스트·애니메이션 성능 최적화 지침
- `state-management.md` — zustand·react-query 역할 분리와 작성 규칙
- `api-conventions.md` — API 추가 시 레이어별(스킴→타입→URL→REST→쿼리 키) 작성 규칙
- `ui-components.md` — theme 토큰·공용 컴포넌트 재사용·SVG 아이콘 작성 규칙
- `navigation.md` — ParamList 타입·새 화면 추가 절차·딥링크 규칙
- `notifications.md` — FCM/notifee 구조·권한 동기화·알림 클릭 딥링크 규칙
- `dev-environment.md` — .env·`__dev__` 도구·patch-package·빌드 문제 해결 규칙

## 서브에이전트

성격별 작업은 `.claude/agents/`의 전담 에이전트에 위임한다.

- `implementer` — 기능 구현·코드 작성 (컨벤션·성능 규칙 준수, 완료 후 tsc/prettier/lint)
- `test-writer` — jest 테스트 작성·실행 (배치·모킹 컨벤션 준수, 프로덕션 코드는 수정하지 않음)
- `code-reviewer` — 커밋/PR 전 코드 리뷰 (읽기 전용, 심각도별 보고)
- `debugger` — 버그 원인 분석·최소 수정 (원인 규명 전 수정 금지)
