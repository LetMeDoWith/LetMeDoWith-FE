import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

import { useDevToolsStore, getNextNetworkId } from 'components/__dev__/devToolsStore';

const REQUEST_ID_KEY = '__devtools_id__';

let requestInterceptorId: number | null = null;
let responseInterceptorId: number | null = null;

const installNetworkInterceptor = (client: AxiosInstance) => {
  requestInterceptorId = client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const id = getNextNetworkId();
    (config as unknown as Record<string, unknown>)[REQUEST_ID_KEY] = id;

    const url = (config.baseURL || '') + (config.url || '');

    useDevToolsStore.getState().pushNetworkRequest({
      id,
      method: (config.method || 'GET').toUpperCase(),
      url,
      status: 'pending',
      startTime: Date.now(),
      requestHeaders: config.headers as Record<string, string>,
      requestBody: config.data,
    });

    return config;
  });

  responseInterceptorId = client.interceptors.response.use(
    (response: AxiosResponse) => {
      const id = (response.config as unknown as Record<string, unknown>)[REQUEST_ID_KEY] as number | undefined;
      if (id != null) {
        const startTime = useDevToolsStore.getState().networkRequests.find(r => r.id === id)?.startTime ?? Date.now();

        useDevToolsStore.getState().updateNetworkRequest(id, {
          status: 'fulfilled',
          statusCode: response.status,
          duration: Date.now() - startTime,
          responseHeaders: response.headers as Record<string, string>,
          responseBody: response.data,
        });
      }
      return response;
    },
    error => {
      const config = error?.config;
      if (config) {
        const id = (config as unknown as Record<string, unknown>)[REQUEST_ID_KEY] as number | undefined;
        if (id != null) {
          const startTime = useDevToolsStore.getState().networkRequests.find(r => r.id === id)?.startTime ?? Date.now();

          useDevToolsStore.getState().updateNetworkRequest(id, {
            status: 'rejected',
            statusCode: error?.response?.status,
            duration: Date.now() - startTime,
            responseHeaders: error?.response?.headers as Record<string, string>,
            responseBody: error?.response?.data,
          });
        }
      }
      return Promise.reject(error);
    },
  );
};

const uninstallNetworkInterceptor = (client: AxiosInstance) => {
  if (requestInterceptorId != null) {
    client.interceptors.request.eject(requestInterceptorId);
    requestInterceptorId = null;
  }
  if (responseInterceptorId != null) {
    client.interceptors.response.eject(responseInterceptorId);
    responseInterceptorId = null;
  }
};

export { installNetworkInterceptor, uninstallNetworkInterceptor };
