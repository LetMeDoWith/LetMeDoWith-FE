import { StateCreator } from 'zustand';

export interface OnboardingSlice {
  /*
   * 첫 도리 등록 후 뜨는 온보딩을 이미 봤는지. 원본은 서버(member API의 isOnBoarded)다.
   * 도리를 등록할 때 온보딩 완료 API를 같이 보낼지 바로 판단해야 해서 로컬에 사본을 둔다.
   * member API를 서버에서 새로 받아 올 때마다 서버 값으로 맞춘다(useFetchMyDowithInfo).
   */
  isOnBoarded: boolean;
  onboardingActions: {
    setIsOnBoarded: (isOnBoarded: boolean) => void;
    resetOnboarding: () => void;
  };
}

export const INITIAL_ONBOARDING_STORAGE_VALUE = {
  isOnBoarded: false,
};

export const createOnboardingSlice: StateCreator<OnboardingSlice, [], [], OnboardingSlice> = set => ({
  ...INITIAL_ONBOARDING_STORAGE_VALUE,
  onboardingActions: {
    setIsOnBoarded: isOnBoarded => set({ isOnBoarded }),
    resetOnboarding: () => set(INITIAL_ONBOARDING_STORAGE_VALUE),
  },
});
