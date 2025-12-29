import { StateCreator } from 'zustand';

import { secureStorage, STORAGE_KEY } from 'stores/secure';
import { INITIAL_NOTIFICATION_STORAGE_VALUE } from 'stores/notification/slice';

type Token = {
  token: string;
  expireAt: string;
};

export interface AuthSlice {
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
  authActions: {
    setTokenInfo: (token: Partial<AuthSlice['tokenInfo']>) => void;
    setMemberId: (id: AuthSlice['memberId']) => void;
    initAuthInfo: () => void;
    setIsLoggedIn: (value: boolean) => void;
    setIsNeedSignUp: (value: boolean) => void;
    setIsNeedRefreshToken: (value: boolean) => void;
    setIsHydrated: (value: boolean) => void;
  };
}

export const INITIAL_AUTH_STORAGE_VALUE = {
  tokenInfo: {
    signup: null,
    access: null,
    refresh: null,
  },
  memberId: null,
};

const initialAuthState = {
  ...INITIAL_AUTH_STORAGE_VALUE,
  isLoggedIn: false,
  isNeedSignUp: true,
  isNeedRefreshToken: false,
  isHydrated: false,
};

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set, get) => ({
  ...initialAuthState,
  authActions: {
    setMemberId: id => set({ memberId: id }),
    setIsLoggedIn: isLoggedIn => set({ isLoggedIn }),
    setIsNeedSignUp: isNeedSignUp => set({ isNeedSignUp }),
    setIsNeedRefreshToken: isNeedRefreshToken => set({ isNeedRefreshToken }),
    setIsHydrated: isHydrated => set({ isHydrated }),
    setTokenInfo: info => {
      set({ tokenInfo: { ...get().tokenInfo, ...info } });
    },
    initAuthInfo: async () => {
      try {
        await secureStorage().setItem(
          STORAGE_KEY.MERGED_INFO,
          JSON.stringify({
            ...INITIAL_AUTH_STORAGE_VALUE,
            ...INITIAL_NOTIFICATION_STORAGE_VALUE,
          }),
        );
        set({ ...initialAuthState, isHydrated: true });
      } catch (error) {
        console.error('인증 정보 초기화에 실패했습니다.', error);
      }
    },
  },
});
