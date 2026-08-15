# API 컨벤션 지침

API 하나를 추가할 때는 아래 5개 레이어를 순서대로 작성한다. 레이어를 건너뛰거나(컴포넌트에서 axios 직접 호출 금지) 순서를 섞지 않는다.

```
schemes/<도메인>/api.ts     ① zod 스킴 정의
types/<도메인>/scheme/api.ts ② z.infer로 타입 파생
services/urls.ts            ③ URL 상수 추가
services/rest/<도메인>.ts    ④ API 함수 작성
constants/queries/index.ts  ⑤ 쿼리 키 추가
hooks/queries/<도메인>/      ⑥ react-query 훅 작성 (상태 관리 지침 참조)
```

## ① zod 스킴 — `schemes/<도메인>/api.ts`

- 요청은 `<동사><대상>RequestScheme`, 응답은 `<동사><대상>ResponseScheme` 네이밍 (`fetchTaskListResponseScheme`).
- 응답 스킴은 반드시 `schemes/shared/api.ts`의 베이스를 확장한다:
  - 일반 응답: `BaseResponseScheme.extend({ data: ... })`
  - 페이지네이션: `BasePageResponseScheme.extend({ ... })`, 요청은 `PageRequestScheme` 재사용
  - 빈 응답: `EmptyDataResponseScheme`
- 각 필드에 `.describe('한국어 설명')`을 붙인다 — 스킴이 곧 API 문서다.
- 서버 enum은 `schemes/<도메인>/enum.ts`에 `z.enum`(또는 기존 스타일)으로 정의하고 스킴에서 참조한다.
- 도메인 간 공통 엔티티는 복붙하지 말고 `.extend()` / `.omit()` / `.pick()`으로 파생한다 (`dowithTaskScheme` = `todoTaskScheme.omit(...).extend(...)` 참고).

## ② 타입 — `types/<도메인>/scheme/api.ts`

- 타입은 손으로 다시 쓰지 않는다. **전부 `z.infer`로 파생**한다:
  ```ts
  type fetchTaskListResponseSchemeType = z.infer<typeof fetchTaskListResponseScheme>;
  ```
- 네이밍: `<스킴이름>Type` (소문자 시작 유지 — 기존 컨벤션).
- 컴포넌트·훅·rest 함수는 스킴이 아니라 이 타입을 `import type`으로 가져다 쓴다.

## ③ URL — `services/urls.ts`

- `<도메인>_API` 객체에 `as const`로 추가. 경로는 `v1/...` 상대 경로(BASE_URL이 `/api/`까지 포함).
- 경로 파라미터는 `:id` 플레이스홀더로 정의하고, rest 함수에서 `TASK_API.SUCCESS_TODO.replace(':id', String(id))`로 치환한다.
- URL 문자열을 rest 함수에 하드코딩하지 않는다.

## ④ REST 함수 — `services/rest/<도메인>.ts`

- 훅과 이름을 맞춘 동사형 네이밍: `fetchTaskList`, `addTodoTask`, `updateStatusTodoTask`, `likeDowithTask`.
- 반드시 `services/apiClient`의 `apiClient`를 사용한다(axios 직접 생성 금지 — 토큰·User-Agent·타임존 헤더가 인터셉터에서 주입된다).
- 형태는 기존 패턴을 따른다:
  ```ts
  const fetchTaskList = async (params: fetchTaskListRequestSchemeType): Promise<fetchTaskListResponseSchemeType> => {
    const result = await apiClient.get<fetchTaskListResponseSchemeType>(TASK_API.LIST, { params });
    return result.data;
  };
  ```
  GET 쿼리는 `{ params }`, POST/PUT 바디는 두 번째 인자. 제네릭으로 응답 타입을 명시한다.
- 에러는 여기서 삼키지 않는다 — 그대로 던져서 react-query의 `ApiError`로 흘러가게 한다. `try { } catch (e) { throw e }`는 무의미하므로 새 코드에는 쓰지 않는다.
- 파일 하단에서 일괄 named export.

## ⑤ 쿼리 키 — `constants/queries/index.ts`

- `<도메인>_QUERY_KEY` 객체에 `as const`로 추가. 계층 구조: `['도메인', '대상', '수식어']` (`['task', 'category', 'list']`).
- 같은 데이터를 가리키는 키는 하나만 존재해야 한다. invalidate가 겹치도록 상위 계층을 공유시킨다(목록: `['task', 'list']`, 파라미터는 훅에서 `[...KEY.LIST, year, month]`로 확장).

## 에러 처리

- API 에러 타입은 항상 `services/apiClient`의 `ApiError` (`AxiosError<BaseResponseSchemeType>`). 서버 메시지는 `error.response?.data.message`로 접근한다.
- 사용자에게 보여줄 실패 알림은 `showSnackbar(message, { type: SNACKBAR_TYPE.ERROR })`를 사용한다. `Alert` 등 다른 수단을 새로 도입하지 않는다.
- 개별 훅의 `onError`에서 처리할지, 호출부에서 처리할지는 기존 유사 훅을 따른다. 조용히 삼키는 빈 catch 금지.

## 인증 관련 주의

- 토큰은 요청 인터셉터가 `useStore.getState()`에서 읽어 자동 주입한다(`signup` 토큰 우선). API 함수·훅에서 토큰을 직접 다루지 않는다.
- 토큰 저장·갱신 상태는 `stores/auth` slice의 `authActions`로만 변경한다.
