import { create } from 'zustand';

interface LoadingOverlayState {
  // 전역 로딩 오버레이 억제 여부.
  // 자동 새로고침·당겨서 새로고침처럼 자체 로딩 표시(스낵바/네이티브 스피너)가 있는 refetch 동안
  // 전역 오버레이를 숨기기 위해 사용한다.
  isSuppressed: boolean;
  setSuppressed: (isSuppressed: boolean) => void;
}

const useLoadingOverlayStore = create<LoadingOverlayState>(set => ({
  isSuppressed: false,
  setSuppressed: isSuppressed => set({ isSuppressed }),
}));

// 전역 오버레이를 숨긴 채 refetch 등을 실행하는 헬퍼. 완료(성공/실패) 시 항상 억제를 해제한다.
const runWithSuppressedOverlay = async <T>(task: () => Promise<T>): Promise<T> => {
  const { setSuppressed } = useLoadingOverlayStore.getState();
  setSuppressed(true);
  try {
    return await task();
  } finally {
    setSuppressed(false);
  }
};

export { useLoadingOverlayStore, runWithSuppressedOverlay };
