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
  initAuthInfo: () => void;
  setIsLoggedIn: (value: boolean) => void;
  setIsNeedSignUp: (value: boolean) => void;
  setIsNeedRefreshToken: (value: boolean) => void;
  setIsHydrated: (value: boolean) => void;
};

const INITIAL_STORAGE_VALUE = {
  tokenInfo: {
    signup: null,
    access: null,
    refresh: null,
  },
  memberId: null,
};

const initialState = {
  ...INITIAL_STORAGE_VALUE,
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
        initAuthInfo: async () => {
          try {
            await secureStorage().setItem(STORAGE_KEY.AUTH_INFO, JSON.stringify(INITIAL_STORAGE_VALUE));
            set({ ...initialState, isHydrated: true });
          } catch (error) {
            console.error('인증 정보 초기화에 실패했습니다.', error);
          }
        },
      },
    }),
    {
      name: STORAGE_KEY.AUTH_INFO,
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
          memberId,
          actions: {
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
          // 초기 토큰 정보가 아얘 없는 경우
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
          setIsNeedSignUp(false);
          setIsNeedRefreshToken(false);

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
              setIsLoggedIn(false);
              setIsNeedSignUp(false);

              // refresh 토큰이 만료되지 않았을 경우
              if (dayjs().isBefore(tokenInfo.refresh.expireAt)) {
                setIsNeedRefreshToken(true);
              } else {
                // refresh 토큰이 만료되었을 경우 인증 정보 상태 및 스토리지 초기화
                initAuthInfo();
              }
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

export { useAuthStore, INITIAL_STORAGE_VALUE };
