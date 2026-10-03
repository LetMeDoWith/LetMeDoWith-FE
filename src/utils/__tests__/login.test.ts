/*
 * 소셜 로그인 실패 처리 테스트. 사용자가 취소한 경우는 조용히 넘기고,
 * 진짜 실패만 Sentry 보고 + 스낵바 안내하는지 검증한다.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockCaptureHandledError = jest.fn();
const mockShowSnackbar = jest.fn();

jest.mock('utils/sentry', () => ({
  captureHandledError: (...args: unknown[]) => mockCaptureHandledError(...args),
}));
jest.mock('stores/snackbarStore', () => ({
  showSnackbar: (...args: unknown[]) => mockShowSnackbar(...args),
  SNACKBAR_TYPE: { ERROR: 'ERROR' },
}));

import { isKakaoLoginCancelled, reportLoginFailure } from 'utils/login';

describe('reportLoginFailure', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('실패를 제공자별 태그로 보고하고 사용자에게 스낵바로 안내한다', () => {
    const error = new Error('network');
    reportLoginFailure('KAKAO', error);
    expect(mockCaptureHandledError).toHaveBeenCalledWith(error, 'login.kakao');
    expect(mockShowSnackbar).toHaveBeenCalledWith('로그인에 실패했어요. 다시 시도해 주세요.', { type: 'ERROR' });
  });
});

describe('isKakaoLoginCancelled', () => {
  it('Android·iOS 카카오 SDK의 취소 메시지를 취소로 본다', () => {
    expect(isKakaoLoginCancelled(new Error('user cancelled.'))).toBe(true);
    expect(isKakaoLoginCancelled(new Error('The authentication session has been canceled by user.'))).toBe(true);
  });

  it('그 밖의 에러는 실패로 본다', () => {
    expect(isKakaoLoginCancelled(new Error('Network error'))).toBe(false);
    expect(isKakaoLoginCancelled(undefined)).toBe(false);
  });
});
