import { useCallback, useState } from 'react';
import { RefreshControl, type RefreshControlProps } from 'react-native';

import { runWithSuppressedOverlay } from 'stores/loadingOverlayStore';

// 응답이 매우 빠를 때 스피너가 깜빡이듯 사라지지 않도록 최소로 유지하는 시간(ms)
const MIN_SPINNER_DURATION_MS = 600;

interface Props extends Omit<RefreshControlProps, 'refreshing' | 'onRefresh'> {
  // 새로고침 시 실행할 작업. 반환한 Promise가 끝날 때까지(최소 표시 시간 포함) 네이티브 스피너를 유지한다.
  onRefresh: () => Promise<unknown>;
}

/**
 * 당겨서 새로고침(PTR) 공통 컴포넌트.
 * refreshing 상태를 자체 관리하고, 새로고침 동안 전역 로딩 오버레이를 자동으로 숨겨
 * 네이티브 스피너만 노출한다. RefreshControl 대신 그대로 사용하면 된다.
 */
const PullToRefreshControl = ({ onRefresh, ...rest }: Props) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // 실제 새로고침과 최소 표시 시간을 함께 기다려, 응답이 빨라도 스피너가 잠깐은 보이게 한다.
      await Promise.all([
        runWithSuppressedOverlay(onRefresh),
        new Promise(resolve => setTimeout(resolve, MIN_SPINNER_DURATION_MS)),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return <RefreshControl {...rest} refreshing={refreshing} onRefresh={handleRefresh} />;
};

export { PullToRefreshControl };
