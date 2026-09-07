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

/* 화면 아래에서 띄우는 기본 위치. 바텀시트 위에 띄울 때만 호출부가 값을 올려 잡는다. */
const DEFAULT_SNACKBAR_BOTTOM_OFFSET = 16;

interface ShowSnackbarOptions {
  type?: SnackbarType;
  duration?: number;
  /* 화면 아래 끝에서 얼마나 띄울지(px). 바텀시트에 가리지 않게 할 때 시트 높이를 넘긴다. */
  bottomOffset?: number;
}

interface SnackbarState {
  visible: boolean;
  message: string;
  duration: number;
  type: SnackbarType;
  bottomOffset: number;
  show: (message: string, options?: ShowSnackbarOptions) => void;
  hide: () => void;
}

const useSnackbarStore = create<SnackbarState>(set => ({
  visible: false,
  message: '',
  duration: DEFAULT_SNACKBAR_DURATION_MS,
  type: SNACKBAR_TYPE.INFO,
  bottomOffset: DEFAULT_SNACKBAR_BOTTOM_OFFSET,
  show: (message, options) =>
    set({
      visible: true,
      message,
      type: options?.type ?? SNACKBAR_TYPE.INFO,
      duration: options?.duration ?? DEFAULT_SNACKBAR_DURATION_MS,
      bottomOffset: options?.bottomOffset ?? DEFAULT_SNACKBAR_BOTTOM_OFFSET,
    }),
  hide: () => set({ visible: false }),
}));

// 컴포넌트 외부(훅/유틸)에서도 호출할 수 있는 헬퍼. type/duration은 options로 조정한다.
const showSnackbar = (message: string, options?: ShowSnackbarOptions) =>
  useSnackbarStore.getState().show(message, options);

export { useSnackbarStore, showSnackbar, SNACKBAR_TYPE, DEFAULT_SNACKBAR_DURATION_MS, DEFAULT_SNACKBAR_BOTTOM_OFFSET };
export type { SnackbarType, ShowSnackbarOptions };
