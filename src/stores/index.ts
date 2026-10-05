import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import dayjs from 'dayjs';

import { secureStorage, STORAGE_KEY } from 'stores/secure';
import { setSentryUser } from 'utils/sentry';
import { AuthSlice, createAuthSlice } from 'stores/auth/slice';
import { createNotificationSlice, NotificationSlice } from 'stores/notification/slice';
import { createOnboardingSlice, OnboardingSlice } from 'stores/onboarding/slice';

type MergedStoreState = AuthSlice & NotificationSlice & OnboardingSlice;

const useStore = create<MergedStoreState>()(
  persist(
    (...args) => ({
      ...createAuthSlice(...args),
      ...createNotificationSlice(...args),
      ...createOnboardingSlice(...args),
    }),
    {
      name: STORAGE_KEY.MERGED_INFO,
      storage: createJSONStorage(secureStorage),
      partialize: ({ tokenInfo, memberId, notificationSettings, isOnBoarded }) => ({
        tokenInfo,
        memberId,
        notificationSettings,
        isOnBoarded,
      }),
      onRehydrateStorage: () => (mergedState, error) => {
        console.log('Rehydrating merged state from encrypted storage');
        if (error) {
          console.error('onRehydrate error: ', error);
        }
        console.log('mergedState: ', mergedState);

        if (!mergedState) {
          return;
        }

        const {
          tokenInfo,
          memberId,
          authActions: { setIsLoggedIn, setIsNeedSignUp, setIsNeedRefreshToken, initAuthInfo, setIsHydrated },
          notificationActions: { resetNotificationSettings },
        } = mergedState;

        try {
          // 초기 토큰 정보가 없는 경우
          if (
            !tokenInfo ||
            (tokenInfo.signup === null && tokenInfo.access === null && tokenInfo.refresh === null && !memberId)
          ) {
            setIsHydrated(true);
            return;
          }
          /* 앱 재시작 복원 시에는 setMemberId가 불리지 않으므로 여기서 직접 설정한다 */
          if (memberId) {
            setSentryUser(memberId);
          }
          setIsLoggedIn(true);

          // 회원가입을 완료하지 않았을 경우
          if (tokenInfo.signup) {
            if (dayjs().isAfter(tokenInfo.signup.expireAt)) {
              setIsLoggedIn(false);
            }
          }

          // 액세스 토큰, refresh 토큰이 존재하는 경우
          if (tokenInfo.access && tokenInfo.refresh) {
            if (dayjs().isAfter(tokenInfo.access.expireAt)) {
              setIsLoggedIn(false);

              if (dayjs().isBefore(tokenInfo.refresh.expireAt)) {
                setIsNeedRefreshToken(true);
              } else {
                initAuthInfo();
                resetNotificationSettings();
              }
            } else {
              setIsNeedSignUp(false);
            }
          }

          setIsHydrated(true);
        } catch (error) {
          console.error('Storage Hydrate에 실패했습니다. ', error);
        }
      },
    },
  ),
);

export { useStore };
