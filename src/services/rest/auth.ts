import { apiClient } from 'services/apiClient';
import { AUTH_API } from 'services/urls';
import { getTokenRequestSchemeType, getTokenResponseSchemeType } from 'types/auth/scheme/api';

/**
 * 토큰 발급 api
 * @param payload provider(로그인 기능 제공자), idToken(사용자의 정보를 담고 있는 토큰)
 */
const getToken = async (payload: getTokenRequestSchemeType): Promise<getTokenResponseSchemeType> => {
  const result = await apiClient.post<getTokenResponseSchemeType>(AUTH_API.GET_TOKEN, payload);
  return result.data;
};

export { getToken };
