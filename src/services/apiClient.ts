import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({ baseURL: BASE_URL });

apiClient.interceptors.request.use(config => {
  return config;
});

apiClient.interceptors.response.use(response => {
  return response;
});

export { apiClient };
