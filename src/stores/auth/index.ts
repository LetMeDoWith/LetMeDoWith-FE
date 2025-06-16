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
  memberId: string | null;
  isLoggedIn: boolean;
  isNeedSignUp: boolean;
  isNeedRefreshToken: boolean;
  isHydrated: boolean;
};

type Action = {
  setTokenInfo: (token: Partial<State['tokenInfo']>) => void;
  setMemberId: (id: State['memberId']) => void;
  removeTokenInfo: () => void;
  setIsLoggedIn: (value: boolean) => void;
  setIsNeedSignUp: (value: boolean) => void;
  setIsNeedRefreshToken: (value: boolean) => void;
  setIsHydrated: (value: boolean) => void;
};

const initialState = {
  tokenInfo: {
    signup: null,
    access: null,
    refresh: null,
  },
  memberId: null,
  isLoggedIn: false,
  isNeedSignUp: false,
  isNeedRefreshToken: false,
  isHydrated: false,
};

const useAuthStore = create<State & { actions: Action }>()(
  persist(
    (set, get) => ({
      ...initialState,
      actions: {
        setMemberId: (id: State['memberId']) => set({ memberId: id }),
        setIsLoggedIn: (isLoggedIn: boolean) => set({ isLoggedIn }),
        setIsNeedSignUp: (isNeedSignUp: boolean) => set({ isNeedSignUp }),
        setIsNeedRefreshToken: (isNeedRefreshToken: boolean) => set({ isNeedRefreshToken }),
        setIsHydrated: (isHydrated: boolean) => set({ isHydrated }),
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
      partialize: ({ tokenInfo, memberId }) => ({
        tokenInfo,
        memberId,
      }),
      onRehydrateStorage: () => (mergedState, error) => {
        console.log('Rehydrating state from encrypted storage');
        if (error) {
          console.error('onRehydrate error: ', error);
        }
        console.log('mergedState: ', mergedState);

        if (!mergedState?.tokenInfo) {
          return;
        }

        const {
          tokenInfo,
          actions: { setIsLoggedIn, setIsNeedSignUp, setIsNeedRefreshToken, setTokenInfo, setIsHydrated },
        } = mergedState;

        try {
          if (!tokenInfo) {
            return;
          }

          // 회원가입을 완료하지 않았을 경우
          if (tokenInfo.signup) {
            // 회원가입 토큰이 만료 된 경우
            if (dayjs().isAfter(tokenInfo.signup.expireAt)) {
              setIsLoggedIn(false);
            }
            setIsNeedSignUp(true);
          }

          // 액세스 토큰, refresh 토큰이 존재하는 경우
          if (tokenInfo.access && tokenInfo.refresh) {
            // 액세스 토큰이 만료 된 경우
            if (dayjs().isAfter(tokenInfo.access.expireAt)) {
              // refresh 토큰이 만료된 경우
              if (dayjs().isAfter(tokenInfo.refresh.expireAt)) {
                setIsNeedRefreshToken(true);
              }
              setIsLoggedIn(false);
              setIsNeedSignUp(false);
            }

            setTokenInfo(tokenInfo);
            setIsLoggedIn(true);
            setIsNeedSignUp(false);
            setIsNeedRefreshToken(false);
          }

          setIsHydrated(true);
        } catch (error) {
          console.error('Storage Hydrate에 실패했습니다. ', error);
        }
      },
    },
  ),
);

export { useAuthStore };
