/*
 * 에러 바운더리 판단 유틸 테스트.
 * axios 에러는 isAxiosError가 보는 플래그만 맞춘 객체로 만든다.
 */
import { describe, it, expect } from '@jest/globals';
import type { MutationCacheNotifyEvent, QueryCacheNotifyEvent } from '@tanstack/react-query';

import { QueryClient } from '@tanstack/react-query';

import {
  getErrorVariant,
  isErrorScreenShowing,
  isThrownToBoundary,
  markErrorScreenShown,
  refetchFailedQueries,
  throwOnInitialError,
  toThrowOnError,
} from 'utils/error';

const axiosError = (response?: { status: number; data?: { statusCode?: string } }) =>
  Object.assign(new Error('axios'), { isAxiosError: true, response });

const query = (data: unknown) => ({ state: { data } });

describe('getErrorVariant', () => {
  it('응답 없는 axios 에러는 NETWORK', () => {
    expect(getErrorVariant(axiosError())).toBe('NETWORK');
  });

  it('응답 있는 axios 에러는 DEFAULT', () => {
    expect(getErrorVariant(axiosError({ status: 500 }))).toBe('DEFAULT');
  });

  it('일반 Error(렌더 에러)는 DEFAULT', () => {
    expect(getErrorVariant(new TypeError('x'))).toBe('DEFAULT');
  });
});

describe('throwOnInitialError', () => {
  it('데이터가 없으면 던진다', () => {
    expect(throwOnInitialError(axiosError({ status: 500 }), query(undefined))).toBe(true);
  });

  it('데이터가 있으면(다시 받기 실패) 던지지 않는다', () => {
    expect(throwOnInitialError(axiosError({ status: 500 }), query({ items: [] }))).toBe(false);
  });

  it('E302(토큰 만료)는 데이터가 없어도 던지지 않는다', () => {
    expect(throwOnInitialError(axiosError({ status: 401, data: { statusCode: 'E302' } }), query(undefined))).toBe(
      false,
    );
  });
});

describe('toThrowOnError', () => {
  it('켜면 throwOnInitialError, 끄거나 생략하면 false', () => {
    expect(toThrowOnError(true)).toBe(throwOnInitialError);
    expect(toThrowOnError(false)).toBe(false);
    expect(toThrowOnError()).toBe(false);
  });
});

describe('isThrownToBoundary', () => {
  const errorEvent = (data: unknown, observerOptions: { throwOnError?: unknown }[]) =>
    ({
      type: 'updated',
      action: { type: 'error', error: axiosError({ status: 500 }) },
      query: { state: { data }, observers: observerOptions.map(options => ({ options })) },
    } as unknown as QueryCacheNotifyEvent);

  it('throwOnInitialError 구독이 하나라도 있고 데이터가 없으면 true', () => {
    expect(isThrownToBoundary(errorEvent(undefined, [{}, { throwOnError: throwOnInitialError }]))).toBe(true);
  });

  it('모든 구독이 던지지 않으면 false', () => {
    expect(isThrownToBoundary(errorEvent(undefined, [{}, { throwOnError: false }]))).toBe(false);
  });

  it('데이터가 있으면(다시 받기 실패) false', () => {
    expect(isThrownToBoundary(errorEvent({ items: [] }, [{ throwOnError: throwOnInitialError }]))).toBe(false);
  });

  it('boolean true 구독이면 true', () => {
    expect(isThrownToBoundary(errorEvent(undefined, [{ throwOnError: true }]))).toBe(true);
  });

  it('mutation 이벤트는 false', () => {
    const mutationEvent = {
      type: 'updated',
      action: { type: 'error', error: axiosError({ status: 500 }) },
      mutation: {},
    } as unknown as MutationCacheNotifyEvent;
    expect(isThrownToBoundary(mutationEvent)).toBe(false);
  });
});

describe('refetchFailedQueries', () => {
  /* 토큰 재발급(E302) 뒤에 실패로 남은 조회만 다시 받아, 빈 화면으로 남지 않게 한다(I-3) */
  it('실패 상태인 조회만 다시 요청한다', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    let failedCalls = 0;
    let okCalls = 0;

    await client.fetchQuery({ queryKey: ['ok'], queryFn: () => ++okCalls }).catch(() => {});
    await client
      .fetchQuery({
        queryKey: ['failed'],
        queryFn: () => {
          failedCalls += 1;
          return failedCalls === 1 ? Promise.reject(new Error('E302')) : Promise.resolve('recovered');
        },
      })
      .catch(() => {});

    await refetchFailedQueries(client);

    expect(failedCalls).toBe(2);
    expect(okCalls).toBe(1);
    expect(client.getQueryData(['failed'])).toBe('recovered');
    client.clear();
  });
});

describe('에러 화면 표시 추적', () => {
  /* 에러 화면이 떠 있는 동안 조회 실패 공통 스낵바를 건너뛰기 위한 상태 */
  it('표시 표시를 하면 true, 모두 해제하면 false', () => {
    expect(isErrorScreenShowing()).toBe(false);
    const unmarkA = markErrorScreenShown();
    const unmarkB = markErrorScreenShown();
    expect(isErrorScreenShowing()).toBe(true);
    unmarkA();
    expect(isErrorScreenShowing()).toBe(true);
    unmarkB();
    expect(isErrorScreenShowing()).toBe(false);
  });

  it('같은 해제 함수를 두 번 불러도 한 번만 줄어든다', () => {
    const unmarkA = markErrorScreenShown();
    const unmarkB = markErrorScreenShown();
    unmarkA();
    unmarkA();
    expect(isErrorScreenShowing()).toBe(true);
    unmarkB();
    expect(isErrorScreenShowing()).toBe(false);
  });
});
