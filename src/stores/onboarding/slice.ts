import { StateCreator } from 'zustand';

export interface OnboardingSlice {
  /*
   * 첫 두윗 등록 후 뜨는 코치마크를 이미 봤는지.
   * 서버에 노출 이력 API가 없어 기기에만 저장한다. 재설치하면 다시 보인다.
   */
  hasSeenDowithOnboarding: boolean;
  onboardingActions: {
    completeDowithOnboarding: () => void;
    resetOnboarding: () => void;
  };
}

export const INITIAL_ONBOARDING_STORAGE_VALUE = {
  hasSeenDowithOnboarding: false,
};

export const createOnboardingSlice: StateCreator<OnboardingSlice, [], [], OnboardingSlice> = set => ({
  ...INITIAL_ONBOARDING_STORAGE_VALUE,
  onboardingActions: {
    completeDowithOnboarding: () => set({ hasSeenDowithOnboarding: true }),
    resetOnboarding: () => set(INITIAL_ONBOARDING_STORAGE_VALUE),
  },
});
