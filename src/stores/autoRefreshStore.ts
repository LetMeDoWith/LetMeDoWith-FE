import { create } from 'zustand';

interface AutoRefreshState {
  // 스케줄러에 의한 자동 refetch 진행 여부.
  // 유저 액션 refetch와 구분해, 자동 refetch 동안에는 전역 로딩 오버레이를 숨기기 위해 사용한다.
  isAutoRefreshing: boolean;
  setAutoRefreshing: (isAutoRefreshing: boolean) => void;
}

export const useAutoRefreshStore = create<AutoRefreshState>(set => ({
  isAutoRefreshing: false,
  setAutoRefreshing: isAutoRefreshing => set({ isAutoRefreshing }),
}));
