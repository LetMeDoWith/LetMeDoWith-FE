/* 개발자도구 조회 강제 실패: 모드별 에러 모양과 GET만 끊는지 검증 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import axios from 'axios';

type EventProcessor = (event: unknown, hint?: { originalException?: unknown }) => unknown;
/* 설치 시 등록되는 Sentry 이벤트 프로세서를 붙잡아 직접 실행해 본다 */
let mockEventProcessor: EventProcessor | undefined;
jest.mock('@sentry/react-native', () => ({
  addEventProcessor: (processor: EventProcessor) => {
    mockEventProcessor = processor;
  },
}));

import { useDevToolsStore } from 'components/__dev__/devToolsStore';
import {
  installApiFailureInterceptor,
  isDevToolsForcedError,
} from 'components/__dev__/interceptors/apiFailureInterceptor';

/* 실제 네트워크 대신 항상 200을 돌려주는 어댑터 */
const client = axios.create({
  adapter: async config => ({ data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config }),
});
installApiFailureInterceptor(client);

describe('apiFailureInterceptor', () => {
  beforeEach(() => useDevToolsStore.getState().setApiFailureMode('OFF'));

  it('OFF면 요청을 그대로 보낸다', async () => {
    await expect(client.get('/x')).resolves.toMatchObject({ status: 200 });
  });

  it('NETWORK면 GET을 응답 없는 에러로 끊는다', async () => {
    useDevToolsStore.getState().setApiFailureMode('NETWORK');
    const error = await client.get('/x').catch(e => e);
    expect(axios.isAxiosError(error)).toBe(true);
    expect(error.response).toBeUndefined();
  });

  it('SERVER면 GET을 500 응답 에러로 끊는다', async () => {
    useDevToolsStore.getState().setApiFailureMode('SERVER');
    const error = await client.get('/x').catch(e => e);
    expect(error.response.status).toBe(500);
  });

  it('GET이 아닌 요청은 실패 모드여도 보낸다', async () => {
    useDevToolsStore.getState().setApiFailureMode('NETWORK');
    await expect(client.post('/x', {})).resolves.toMatchObject({ status: 200 });
  });

  /* 개발자도구로 일부러 낸 에러는 Sentry로 보내지 않는다 — 이벤트 프로세서가 이 판별로 거른다 */
  it('강제 실패 에러는 직접이든 cause로 감싸졌든 강제 에러로 판별한다', async () => {
    useDevToolsStore.getState().setApiFailureMode('SERVER');
    const forced = await client.get('/x').catch(e => e);
    const wrapped = Object.assign(new Error('GET /x → 500'), { cause: forced });

    expect(isDevToolsForcedError(forced)).toBe(true);
    expect(isDevToolsForcedError(wrapped)).toBe(true);
    expect(isDevToolsForcedError(new Error('real'))).toBe(false);
    expect(isDevToolsForcedError(undefined)).toBe(false);
  });

  it('Sentry 이벤트 프로세서는 강제 실패 이벤트만 버린다', async () => {
    useDevToolsStore.getState().setApiFailureMode('NETWORK');
    const forced = await client.get('/x').catch(e => e);
    const event = { message: 'event' };

    expect(mockEventProcessor?.(event, { originalException: forced })).toBeNull();
    expect(mockEventProcessor?.(event, { originalException: new Error('real') })).toBe(event);
  });
});
