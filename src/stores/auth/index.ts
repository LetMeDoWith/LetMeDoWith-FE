import EncryptedStorage from 'react-native-encrypted-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import dayjs from 'dayjs';

type Token = {
  token: string;
  expireAt: string;
};

type RefreshToken = Token & {
  memberId: number;
};

type State = {
  tokenInfo: {
    signup: Token | null;
    access: Token | null;
    refresh: RefreshToken | null;
  };
  isLoggedIn: boolean;
  isNeedSignUp: boolean;
};

type Action = {
  getTokenInfo: () => Promise<void>;
  setTokenInfo: (token: Partial<State['tokenInfo']>) => void;
  removeTokenInfo: () => void;
  setIsLoggedIn: (value: boolean) => void;
  setIsNeedSignUp: (value: boolean) => void;
};

const initialState = {
  tokenInfo: {
    signup: null,
    access: null,
    refresh: null,
  },
  isLoggedIn: false,
  isNeedSignUp: false,
};

const useAuthStore = create<State & Action>()(
  persist(
    (set, get) => ({
      ...initialState,
      setIsLoggedIn: (isLoggedIn: boolean) => set({ isLoggedIn }),
      setIsNeedSignUp: (isNeedSignUp: boolean) => set({ isNeedSignUp }),
      getTokenInfo: async () => {
        try {
          const data = await EncryptedStorage.getItem('tokenInfoStorage');

          if (data) {
            const {
              state: { tokenInfo },
            } = JSON.parse(data);

            // 액세스 토큰이 존재하는 경우
            if (tokenInfo.access) {
              // 액세스 토큰이 만료 된 경우
              if (dayjs().isBefore(tokenInfo.access.expireAt)) {
                set({ isLoggedIn: false, isNeedSignUp: true });
                // TODO: 토큰 Refresh API 연동
              } else {
                set({ isLoggedIn: true, isNeedSignUp: false });
              }
            }

            // 회원가입을 완료하지 않았을 경우
            if (tokenInfo.signup) {
              set({ isLoggedIn: true, isNeedSignUp: true });
            }

            set({ tokenInfo });
          }
        } catch (error) {
          console.error('Failed to fetch stored token info:', error);
        }
      },
      setTokenInfo: info => {
        set({ tokenInfo: { ...get().tokenInfo, ...info } });
      },
      removeTokenInfo: async () => {
        try {
          await EncryptedStorage.removeItem('tokenInfoStorage');
          set(initialState);
        } catch (error) {
          console.error('Failed to remove token info:', error);
        }
      },
    }),
    {
      name: 'tokenInfoStorage',
      storage: createJSONStorage(() => EncryptedStorage),
      onRehydrateStorage: () => {
        console.log('Rehydrating state from encrypted storage');
      },
    },
  ),
);

export { useAuthStore };
