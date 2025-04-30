import { Alert } from 'react-native';
import { AxiosError } from 'axios';

import { apiClient } from 'services/apiClient';
import { AUTH_API } from 'services/urls';
import type {
  fetchTokenRequestSchemeType,
  fetchTokenResponseSchemeType,
  refreshTokenRequestSchemeType,
  refreshTokenResponseSchemeType,
} from 'types/auth/scheme/api';

/**
 * 토큰 발급 api
 * @param payload provider(인증 공급자), idToken(사용자의 정보를 담고 있는 토큰)
 */
const fetchToken = async (payload: fetchTokenRequestSchemeType): Promise<fetchTokenResponseSchemeType | undefined> => {
  try {
    const result = await apiClient.post<fetchTokenResponseSchemeType>(AUTH_API.FETCH_TOKEN, payload);
    return result.data;
  } catch (e: unknown) {
    if (e instanceof AxiosError) {
      console.error(e.response?.data);
    }
    Alert.alert('토큰 발급에 실패했습니다.');
  }
};

/**
 * 토큰 재발급 api
 * @param payload refresh token(재발급 토큰)
 */
const refreshToken = async (
  payload: refreshTokenRequestSchemeType,
): Promise<refreshTokenResponseSchemeType | undefined> => {
  try {
    const result = await apiClient.post<refreshTokenResponseSchemeType>(AUTH_API.REFRESH_TOKEN, payload);
    return result.data;
  } catch (e: unknown) {
    if (e instanceof AxiosError) {
      console.error(e.response?.data);
    }
    Alert.alert('토큰 재발급에 실패했습니다.');
  }
};

export { fetchToken, refreshToken };
