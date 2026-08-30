import { StateCreator } from 'zustand';

export interface OnboardingSlice {
  /*
   * 첫 두윗 등록 후 뜨는 코치마크를 이미 봤는지.
   * 서버에 노출 이력 API가 없어 기기에만 저장한다. 재설치하면 다시 보인다.
   */
  hasSeenDowithOnboarding: boolean;
  /*
   * 이번에 코치마크를 띄워야 하는지. 두윗 등록에 성공한 직후에만 켠다.
   * 영속하지 않는다 — 등록 직후 같은 세션에서만 유효해야 하고,
   * 앱을 껐다 켰을 때 다시 뜨면 "등록 직후"라는 맥락이 사라진다.
   */
  isDowithOnboardingPending: boolean;
  onboardingActions: {
    requestDowithOnboarding: () => void;
    completeDowithOnboarding: () => void;
    resetOnboarding: () => void;
  };
}

export const INITIAL_ONBOARDING_STORAGE_VALUE = {
  hasSeenDowithOnboarding: false,
  isDowithOnboardingPending: false,
};

export const createOnboardingSlice: StateCreator<OnboardingSlice, [], [], OnboardingSlice> = set => ({
  ...INITIAL_ONBOARDING_STORAGE_VALUE,
  onboardingActions: {
    requestDowithOnboarding: () => set({ isDowithOnboardingPending: true }),
    completeDowithOnboarding: () => set({ hasSeenDowithOnboarding: true, isDowithOnboardingPending: false }),
    resetOnboarding: () => set(INITIAL_ONBOARDING_STORAGE_VALUE),
  },
});
