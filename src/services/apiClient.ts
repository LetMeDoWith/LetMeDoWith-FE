import axios from 'axios';
import UserAgent from 'react-native-user-agent';

import { useAuthStore } from 'stores/auth';

const BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({ baseURL: BASE_URL });

apiClient.interceptors.request.use(config => {
  const {
    tokenInfo: { access, signup },
    isLoggedIn,
    isNeedSignUp,
  } = useAuthStore();

  const Authorization = `Bearer ${isNeedSignUp ? signup?.token : access?.token}`;

  return {
    ...config,
    ...(isLoggedIn && { Authorization }),
    userAgent: UserAgent.getUserAgent(),
  };
});

apiClient.interceptors.response.use(response => {
  return response;
});

export { apiClient };
