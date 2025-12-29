// store.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import dayjs from 'dayjs';

import { secureStorage, STORAGE_KEY } from 'stores/secure';
import { AuthSlice, createAuthSlice } from 'stores/auth/slice';
import { createNotificationSlice, NotificationSlice } from 'stores/notification/slice';

type MergedStoreState = AuthSlice & NotificationSlice;

const useStore = create<MergedStoreState>()(
  persist(
    (...args) => ({
      ...createAuthSlice(...args),
      ...createNotificationSlice(...args),
    }),
    {
      name: STORAGE_KEY.MERGED_INFO,
      storage: createJSONStorage(secureStorage),
      partialize: ({ tokenInfo, memberId, isNotificationEnabled, notificationSettings }) => ({
        tokenInfo,
        memberId,
        isNotificationEnabled,
        notificationSettings,
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

        // TODO: 알림 상태 동기화
        const {
          tokenInfo,
          memberId,
          authActions: {
            setIsLoggedIn,
            setIsNeedSignUp,
            setIsNeedRefreshToken,
            setTokenInfo,
            initAuthInfo,
            setIsHydrated,
            setMemberId,
          },
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

          setTokenInfo(tokenInfo);
          setMemberId(memberId);
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
