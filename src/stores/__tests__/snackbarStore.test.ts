/*
 * 공통 에러 스낵바 억제 테스트. 자동 갱신처럼 사용자가 하지 않은 요청이 실패할 때
 * 에러 안내가 뜨지 않도록, 감싼 작업이 실행되는 동안에만 억제되는지 검증한다.
 */
import { describe, it, expect } from '@jest/globals';

import { isErrorSnackbarSuppressed, runWithSuppressedErrorSnackbar } from 'stores/snackbarStore';

describe('runWithSuppressedErrorSnackbar', () => {
  it('작업이 실행되는 동안에만 억제하고 끝나면 해제한다', async () => {
    let suppressedDuringTask = false;
    await runWithSuppressedErrorSnackbar(async () => {
      suppressedDuringTask = isErrorSnackbarSuppressed();
    });

    expect(suppressedDuringTask).toBe(true);
    expect(isErrorSnackbarSuppressed()).toBe(false);
  });

  it('작업이 실패해도 억제를 해제한다', async () => {
    await expect(
      runWithSuppressedErrorSnackbar(async () => {
        throw new Error('갱신 실패');
      }),
    ).rejects.toThrow('갱신 실패');

    expect(isErrorSnackbarSuppressed()).toBe(false);
  });

  it('겹쳐 실행되면 마지막 작업이 끝날 때까지 억제를 유지한다', async () => {
    let releaseFirst!: () => void;
    const first = runWithSuppressedErrorSnackbar(() => new Promise<void>(resolve => (releaseFirst = resolve)));
    await runWithSuppressedErrorSnackbar(async () => {});

    expect(isErrorSnackbarSuppressed()).toBe(true);

    releaseFirst();
    await first;
    expect(isErrorSnackbarSuppressed()).toBe(false);
  });
});
