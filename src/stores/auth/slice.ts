import { StateCreator } from 'zustand';

import type { ProviderEnumType } from 'types/auth/scheme/enum';

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
  /* 마지막 소셜 로그인 제공자. 가입 완료 이벤트 파라미터용 — 세션 한정이라 영속하지 않는다. */
  lastLoginProvider: ProviderEnumType | null;
  authActions: {
    setTokenInfo: (token: Partial<AuthSlice['tokenInfo']>) => void;
    setMemberId: (id: AuthSlice['memberId']) => void;
    initAuthInfo: () => void;
    setIsLoggedIn: (value: boolean) => void;
    setIsNeedSignUp: (value: boolean) => void;
    setIsNeedRefreshToken: (value: boolean) => void;
    setIsHydrated: (value: boolean) => void;
    setLastLoginProvider: (provider: ProviderEnumType) => void;
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
  lastLoginProvider: null,
};

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set, get) => ({
  ...initialAuthState,
  authActions: {
    setMemberId: id => set({ memberId: id }),
    setIsLoggedIn: isLoggedIn => set({ isLoggedIn }),
    setIsNeedSignUp: isNeedSignUp => set({ isNeedSignUp }),
    setIsNeedRefreshToken: isNeedRefreshToken => set({ isNeedRefreshToken }),
    setIsHydrated: isHydrated => set({ isHydrated }),
    setLastLoginProvider: provider => set({ lastLoginProvider: provider }),
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
