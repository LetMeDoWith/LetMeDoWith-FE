import axios from 'axios';
import type { MutationCacheNotifyEvent, QueryCacheNotifyEvent, QueryClient } from '@tanstack/react-query';

import { ErrorStatusCodeEnum } from 'schemes/shared/enum';
import type { BaseResponseSchemeType } from 'types/shared/scheme/api';

/* 에러 화면 종류. 응답 자체가 없으면 연결 문제, 나머지(서버 에러·렌더 에러)는 데이터 실패로 안내한다. */
type ErrorVariant = 'NETWORK' | 'DEFAULT';

const getErrorVariant = (error: unknown): ErrorVariant =>
  axios.isAxiosError(error) && !error.response ? 'NETWORK' : 'DEFAULT';

const isTokenExpiredError = (error: unknown) =>
  axios.isAxiosError<BaseResponseSchemeType>(error) &&
  error.response?.data?.statusCode === ErrorStatusCodeEnum.enum.E302;

/*
 * 화면 핵심 조회의 throwOnError. 보여줄 데이터가 하나도 없을 때만 화면 에러 바운더리로 던진다.
 * - 데이터가 있는 상태의 다시 받기(자동 갱신·새로고침) 실패는 던지지 않는다 — 보던 화면을 유지한다.
 * - E302(토큰 만료)는 App.tsx 전역 구독이 재발급 후 다시 요청하므로 던지지 않는다.
 *   던지면 재발급 뒤 요청이 성공해도 에러 화면이 남는다.
 */
const throwOnInitialError = (error: unknown, query: { state: { data: unknown } }) =>
  query.state.data === undefined && !isTokenExpiredError(error);

/* 조회 훅 공통 옵션. 같은 훅이 화면마다 핵심/부가가 달라 부르는 쪽에서 켠다. */
interface BoundaryQueryOptions {
  /* 이 화면의 핵심 데이터일 때 켠다 — 첫 로딩 실패 시 화면 전체를 에러 화면으로 바꾼다 */
  throwOnError?: boolean;
}

const toThrowOnError = (enabled?: boolean) => (enabled ? throwOnInitialError : false);

/*
 * 전역 에러 구독에서, 이 조회 에러를 화면 에러 바운더리가 띄우는지 판단한다(공통 스낵바 생략용).
 * 같은 조회를 여러 화면이 다른 옵션으로 구독할 수 있어, 구독 중 하나라도 던지면 true다.
 */
const isThrownToBoundary = (event: QueryCacheNotifyEvent | MutationCacheNotifyEvent) => {
  if (!('query' in event) || event.type !== 'updated' || event.action.type !== 'error') {
    return false;
  }

  const { query } = event;
  const { error } = event.action;

  return query.observers.some(observer => {
    const { throwOnError } = observer.options;
    return typeof throwOnError === 'function' ? throwOnError(error, query) : Boolean(throwOnError);
  });
};

/*
 * 토큰 재발급이 끝난 뒤 실패로 남은 조회를 다시 받는다.
 * E302 첫 로딩 실패는 에러 화면으로 던지지 않으므로(throwOnInitialError), 다시 받지 않으면 화면이 빈 채로 남는다.
 */
const refetchFailedQueries = (client: QueryClient) =>
  client.refetchQueries({ predicate: query => query.state.status === 'error' });

/*
 * 화면 에러 바운더리가 에러 화면을 보여주는 중인지. 렌더와 무관한 판단이라 스토어가 아닌 모듈 카운터로 둔다
 * (snackbarStore의 억제 카운터와 같은 패턴). 에러 화면이 이미 안내 중일 때 조회 실패 공통 스낵바를 겹쳐 띄우지 않는 데 쓴다.
 */
let shownErrorScreenCount = 0;

/* 에러 화면이 뜰 때 부르고, 돌려받은 함수로 해제한다(여러 번 불러도 한 번만 줄어든다) */
const markErrorScreenShown = () => {
  shownErrorScreenCount += 1;
  let isUnmarked = false;

  return () => {
    if (isUnmarked) {
      return;
    }
    isUnmarked = true;
    shownErrorScreenCount -= 1;
  };
};

const isErrorScreenShowing = () => shownErrorScreenCount > 0;

export {
  markErrorScreenShown,
  isErrorScreenShowing,
  refetchFailedQueries,
  getErrorVariant,
  throwOnInitialError,
  toThrowOnError,
  isThrownToBoundary,
};
export type { ErrorVariant, BoundaryQueryOptions };
