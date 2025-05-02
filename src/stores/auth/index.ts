import EncryptedStorage from 'react-native-encrypted-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import dayjs from 'dayjs';

import { secureStorage, STORAGE_KEY } from 'stores/secure';

type Token = {
  token: string;
  expireAt: string;
};

type State = {
  tokenInfo: {
    signup: Token | null;
    access: Token | null;
    refresh: Token | null;
  };
  isLoggedIn: boolean;
  isNeedSignUp: boolean;
  isNeedRefreshToken: boolean;
};

type Action = {
  validateTokenInfo: () => void;
  setTokenInfo: (token: Partial<State['tokenInfo']>) => void;
  removeTokenInfo: () => void;
  setIsLoggedIn: (value: boolean) => void;
  setIsNeedSignUp: (value: boolean) => void;
  setIsNeedRefreshToken: (value: boolean) => void;
};

const initialState = {
  tokenInfo: {
    signup: null,
    access: null,
    refresh: null,
  },
  isLoggedIn: false,
  isNeedSignUp: false,
  isNeedRefreshToken: false,
};

const useAuthStore = create<State & { actions: Action }>()(
  persist(
    (set, get) => ({
      ...initialState,
      actions: {
        setIsLoggedIn: (isLoggedIn: boolean) => set({ isLoggedIn }),
        setIsNeedSignUp: (isNeedSignUp: boolean) => set({ isNeedSignUp }),
        setIsNeedRefreshToken: (isNeedRefreshToken: boolean) => set({ isNeedRefreshToken }),
        validateTokenInfo: () => {
          try {
            const { tokenInfo } = get();

            if (!tokenInfo) {
              return;
            }

            // 액세스 토큰, refresh 토큰이 존재하는 경우
            if (tokenInfo.access && tokenInfo.refresh) {
              // 액세스 토큰이 만료 된 경우
              if (dayjs().isBefore(tokenInfo.access.expireAt)) {
                set({ isLoggedIn: false, isNeedSignUp: false });
                // refresh 토큰이 만료된 경우
                if (dayjs().isBefore(tokenInfo.refresh.expireAt)) {
                  set({ isNeedRefreshToken: false });
                } else {
                  set({ isNeedRefreshToken: true });
                }
              }
              set({ isLoggedIn: true, isNeedSignUp: false, isNeedRefreshToken: false });
            }

            // 회원가입을 완료하지 않았을 경우
            if (tokenInfo.signup) {
              // 회원가입 토큰이 만료 된 경우
              if (dayjs().isBefore(tokenInfo.signup.expireAt)) {
                set({ isLoggedIn: false, isNeedSignUp: false });
              }
              set({ isLoggedIn: true, isNeedSignUp: true });
            }

            set({ tokenInfo });
          } catch (error) {
            console.error('토큰 정보 저장에 실패했습니다. ', error);
          }
        },
        setTokenInfo: info => {
          set({ tokenInfo: { ...get().tokenInfo, ...info } });
        },
        removeTokenInfo: async () => {
          try {
            await EncryptedStorage.removeItem(STORAGE_KEY.TOKEN_INFO);
            set(initialState);
          } catch (error) {
            console.error('토큰 정보 삭제에 실패했습니다.', error);
          }
        },
      },
    }),
    {
      name: STORAGE_KEY.TOKEN_INFO,
      storage: createJSONStorage(secureStorage),
      partialize: ({ tokenInfo }) => ({
        tokenInfo,
      }),
      onRehydrateStorage: () => (mergedState, error) => {
        console.log('Rehydrating state from encrypted storage');
        if (error) {
          console.error('onRehydrate error: ', error);
        }
        console.log('mergedState: ', mergedState);
      },
    },
  ),
);

export { useAuthStore };
