import { create } from 'zustand';

const DEFAULT_SNACKBAR_DURATION_MS = 2000;

// 스낵바 타입. 타입에 따라 GlobalSnackbar에서 배경색을 다르게 노출한다.
const SNACKBAR_TYPE = {
  INFO: 'INFO', // 기본
  SUCCESS: 'SUCCESS', // 성공(녹색)
  ERROR: 'ERROR', // 에러(빨강)
  WARNING: 'WARNING', // 경고(노랑)
} as const;

type SnackbarType = (typeof SNACKBAR_TYPE)[keyof typeof SNACKBAR_TYPE];

interface ShowSnackbarOptions {
  type?: SnackbarType;
  duration?: number;
}

interface SnackbarState {
  visible: boolean;
  message: string;
  duration: number;
  type: SnackbarType;
  show: (message: string, options?: ShowSnackbarOptions) => void;
  hide: () => void;
}

const useSnackbarStore = create<SnackbarState>(set => ({
  visible: false,
  message: '',
  duration: DEFAULT_SNACKBAR_DURATION_MS,
  type: SNACKBAR_TYPE.INFO,
  show: (message, options) =>
    set({
      visible: true,
      message,
      type: options?.type ?? SNACKBAR_TYPE.INFO,
      duration: options?.duration ?? DEFAULT_SNACKBAR_DURATION_MS,
    }),
  hide: () => set({ visible: false }),
}));

// 컴포넌트 외부(훅/유틸)에서도 호출할 수 있는 헬퍼. type/duration은 options로 조정한다.
const showSnackbar = (message: string, options?: ShowSnackbarOptions) =>
  useSnackbarStore.getState().show(message, options);

export { useSnackbarStore, showSnackbar, SNACKBAR_TYPE, DEFAULT_SNACKBAR_DURATION_MS };
export type { SnackbarType, ShowSnackbarOptions };
