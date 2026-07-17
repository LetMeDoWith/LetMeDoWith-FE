import { create } from 'zustand';

const DEFAULT_SNACKBAR_DURATION_MS = 2000;

interface SnackbarState {
  visible: boolean;
  message: string;
  duration: number;
  show: (message: string, duration?: number) => void;
  hide: () => void;
}

const useSnackbarStore = create<SnackbarState>(set => ({
  visible: false,
  message: '',
  duration: DEFAULT_SNACKBAR_DURATION_MS,
  show: (message, duration = DEFAULT_SNACKBAR_DURATION_MS) => set({ visible: true, message, duration }),
  hide: () => set({ visible: false }),
}));

// 컴포넌트 외부(훅/유틸)에서도 호출할 수 있는 헬퍼. duration(ms)을 넘겨 노출 시간을 조정할 수 있다.
const showSnackbar = (message: string, duration?: number) => useSnackbarStore.getState().show(message, duration);

export { useSnackbarStore, showSnackbar, DEFAULT_SNACKBAR_DURATION_MS };
