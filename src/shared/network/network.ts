import axios, { AxiosInstance } from 'axios';
import { BASE_URL } from '../../env';
import {
  errorInterceptor,
  requestInterceptor,
  responseInterceptor,
} from './interceptors';

export const axios_instance = axios.create({
  baseURL: BASE_URL,
  transformRequest: [
    function (data, headers) {
      if (data instanceof FormData) {
        headers['Content-Type'] = 'multipart/form-data';
        return data;
      } else if (typeof data === 'object') {
        return JSON.stringify(data);
      }

      return data;
    },
  ],
  headers: {
    'Content-Type': 'application/json',
  },
});

export const axios_retry = axios.create({ baseURL: BASE_URL });

const setupInterceptors = (instance: AxiosInstance): AxiosInstance => {
  instance.interceptors.request.use(requestInterceptor, errorInterceptor);
  instance.interceptors.response.use(responseInterceptor, errorInterceptor);

  return instance;
};

setupInterceptors(axios_instance);
