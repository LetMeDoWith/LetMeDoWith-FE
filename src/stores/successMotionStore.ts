import { create } from 'zustand';

/* 도리 인증 성공 모션(딤 + 로띠) 노출 상태. 영속이 필요 없는 전역 UI라 독립 스토어로 둔다. */
interface SuccessMotionState {
  visible: boolean;
  show: () => void;
  hide: () => void;
}

const useSuccessMotionStore = create<SuccessMotionState>(set => ({
  visible: false,
  show: () => set({ visible: true }),
  hide: () => set({ visible: false }),
}));

/* 인증 업로드 훅처럼 컴포넌트 밖에서 부르는 헬퍼 */
const showDoriSuccessMotion = () => useSuccessMotionStore.getState().show();

export { useSuccessMotionStore, showDoriSuccessMotion };
