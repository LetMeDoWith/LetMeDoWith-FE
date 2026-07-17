import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { useAppState } from 'hooks/shared/useAppState';
import { useAutoRefreshStore } from 'stores/autoRefreshStore';
import { showSnackbar } from 'stores/snackbarStore';
import { IS_DEV_MODE } from 'utils/env';

/**
 * 정시 기준 5분 간격(1분, 6분, 11분, ..., 56분)으로 지정된 쿼리를 무효화하는 훅.
 * - 포그라운드 상태에서만 동작
 * - 모든 유저가 동시에 요청하는 것을 방지하기 위해 랜덤 offset(0~1초) 적용
 */
const INTERVAL_MINUTES = 5;
const TARGET_OFFSET_MINUTE = 1; // 정시 기준 1분, 6분, 11분, ...
const MAX_RANDOM_DELAY_MS = 1_000; // 최대 1초 랜덤 지연

const getNextRefetchDelay = (): number => {
  const now = dayjs();
  const currentMinute = now.minute();

  // 다음 타겟 분 계산 (1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56)
  const minuteInCycle =
    (((currentMinute - TARGET_OFFSET_MINUTE) % INTERVAL_MINUTES) + INTERVAL_MINUTES) % INTERVAL_MINUTES;
  const nextTargetMinute = currentMinute + (INTERVAL_MINUTES - minuteInCycle);
  const nextTarget = now
    .second(0)
    .millisecond(0)
    .add(nextTargetMinute - currentMinute, 'minute');

  const baseDelay = nextTarget.diff(now);
  const randomOffset = Math.floor(Math.random() * MAX_RANDOM_DELAY_MS) + 1;

  return baseDelay + randomOffset;
};

const useScheduledRefetch = (queryKeys: readonly (readonly string[])[]) => {
  const queryClient = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isActiveRef = useRef(AppState.currentState === 'active');

  const scheduleNext = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!isActiveRef.current) {
      return;
    }

    const delay = getNextRefetchDelay();

    console.log('delay: ', delay);

    timerRef.current = setTimeout(async () => {
      // 개발 모드에서는 자동 refresh가 동작 중임을 로딩 아이콘 대신 스낵바로 알린다.
      if (IS_DEV_MODE) {
        showSnackbar('[DEV] 자동 새로고침 완료', 2000);
      }

      // 자동 refetch 동안에는 전역 로딩 오버레이를 띄우지 않도록 플래그를 세운다.
      const { setAutoRefreshing } = useAutoRefreshStore.getState();
      setAutoRefreshing(true);
      try {
        await Promise.all(queryKeys.map(queryKey => queryClient.invalidateQueries({ queryKey: [...queryKey] })));
      } finally {
        setAutoRefreshing(false);
      }

      scheduleNext();
    }, delay);
  };

  useAppState(state => {
    if (state === 'active') {
      isActiveRef.current = true;
      scheduleNext();
    } else {
      isActiveRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  });

  useEffect(() => {
    scheduleNext();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export { useScheduledRefetch };
