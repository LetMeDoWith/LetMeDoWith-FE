import axios, { AxiosError } from 'axios';
import UserAgent from 'react-native-user-agent';
import Config from 'react-native-config';
import { useStore } from 'stores/index';
import type { BaseResponseSchemeType } from 'types/shared/scheme/api';

type ApiError = AxiosError<BaseResponseSchemeType>;

const BASE_URL = `https://${Config.DEV_API_URL}/api/`;

const apiClient = axios.create({ baseURL: BASE_URL });

apiClient.interceptors.request.use(config => {
  const {
    tokenInfo: { access, signup },
  } = useStore.getState();

  config.headers = config.headers || {};
  config.headers['User-Agent'] = UserAgent.getUserAgent();
  config.headers['X-Time-Zone'] = 'Asia/Seoul';
  config.headers.Authorization = `Bearer ${signup?.token ?? access?.token}`;

  return config;
});

apiClient.interceptors.response.use(response => {
  return response;
});

export { apiClient };
export type { ApiError };
