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
 * @param payload provider(로그인 기능 제공자), idToken(사용자의 정보를 담고 있는 토큰)
 */
const fetchToken = async (payload: fetchTokenRequestSchemeType): Promise<fetchTokenResponseSchemeType> => {
  const result = await apiClient.post<fetchTokenResponseSchemeType>(AUTH_API.FETCH_TOKEN, payload);
  return result.data;
};

/**
 * 토큰 재발급 api
 * @param payload refresh token(재발급 토큰)
 */
const refreshToken = async (payload: refreshTokenRequestSchemeType): Promise<refreshTokenResponseSchemeType> => {
  const result = await apiClient.post<refreshTokenResponseSchemeType>(AUTH_API.REFRESH_TOKEN, payload);
  return result.data;
};

export { fetchToken, refreshToken };
