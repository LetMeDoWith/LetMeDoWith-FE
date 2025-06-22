import axios from 'axios';
import UserAgent from 'react-native-user-agent';
import Config from 'react-native-config';

import { useAuthStore } from 'stores/auth';

const BASE_URL = `https://${Config.DEV_API_URL}/api/`;

const apiClient = axios.create({ baseURL: BASE_URL });

apiClient.interceptors.request.use(config => {
  const {
    tokenInfo: { access, signup },
  } = useAuthStore.getState();

  config.headers = config.headers || {};
  config.headers['User-Agent'] = UserAgent.getUserAgent();
  config.headers.Authorization = `Bearer ${signup?.token ?? access?.token}`;

  return config;
});

apiClient.interceptors.response.use(response => {
  return response;
});

export { apiClient };
