import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { Platform } from 'react-native';
import { BASE_URL } from '../../env';
import URL from '../../app/authentication/constants/url';
import { axios_retry } from './network';
let accessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmE1ODFmYjdhYzMxNDMwZjAyYjYzYmIiLCJpYXQiOjE3MjIzNzI1MjcsImV4cCI6MTcyMjM3MjU4N30.ZWnPkU8W93RIkCR6p8f3rO-F1i4urle66QupJW8xBnk';
let refreshToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmE1ODFmYjdhYzMxNDMwZjAyYjYzYmIiLCJpYXQiOjE3MjIzNzI1MjcsImV4cCI6MTcyMjM3MzEyN30.EXj8qOYX5l_eJi7r1tfsKFJve5aEQwEW3jOtgbq6ZrA';

const getAuthToken = () => {
  return accessToken;
};

interface RetryQueueItem {
  resolve: (value?: any) => void;
  config: AxiosRequestConfig;
}

// Create a list to hold the request queue
let refreshAndRetryQueue: RetryQueueItem[] = [];

// Flag to prevent multiple token refresh requests
let isRefreshing = false;

const requestInterceptor = async (
  config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig> => {
  const { headers } = config;
  headers['platform'] = Platform.OS;
  headers['Authorization'] = `bearer ${getAuthToken()}`;
  config.headers = headers;

  if (isRefreshing) {
    const newConfig: InternalAxiosRequestConfig = await new Promise(
      (resolve) => {
        refreshAndRetryQueue.push({ resolve, config });
      }
    );

    return newConfig;
  }

  return config;
};

const responseInterceptor = (response: AxiosResponse): AxiosResponse => {
  try {
    const { method, url } = response.config;
    const { status, data } = response;

    if (status === 200 && data) {
      // If data is not an empty object, return the response
      if (Object.keys(data).length > 0) {
        return response;
      }
      throw new Error(`Empty response data: ${url}`);
    } else {
      throw new Error(`Unexpected response status: ${status} `);
    }
  } catch (error) {
    console.error('responseInterceptor: ', error);
    throw error;
  }
};

const errorInterceptor = async (error: AxiosError | Error) => {
  if (axios.isAxiosError(error)) {
    const { status } = (error.response as AxiosResponse) ?? {};

    if (status === 401) {
      return await refreshAndRetry(error.config);
    }
  } else {
    return Promise.reject(`Network Error: ${error}`);
  }

  return Promise.reject(error);
};

const refreshAccessToken = async () => {
  const response = await axios.post<{
    accessToken: string;
    refreshToken: string;
  }>(`${BASE_URL}${URL.REFRESH_TOKEN}`, {
    refreshToken,
  });

  accessToken = response.data.accessToken;
  refreshToken = response.data.refreshToken;

  return refreshToken;
};

const callPendingQueueRequests = async () => {
  if (refreshAndRetryQueue.length > 0) {
    refreshAndRetryQueue.forEach(({ resolve, config }) => {
      const newConfig = config;
      newConfig.headers['Authorization'] = `Bearer ${accessToken}`;
      console.log('callPendingQueueRequests URL: ', config.url);
      resolve(newConfig);
    });
    refreshAndRetryQueue = [];
  }
};

const refreshAndRetry = async (config: AxiosRequestConfig) => {
  const originalRequest = config;
  try {
    isRefreshing = true;
    await refreshAccessToken();
    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
    const data = await axios_retry(originalRequest);
    callPendingQueueRequests();
    isRefreshing = false;
    return data.data;
  } catch (error) {
    isRefreshing = false;
    console.error('refreshAndRetry:  ', error);
    console.log('MAKE USER LOGOUT');
    refreshAndRetryQueue = [];
    //logout app and redirect to login page
    throw error;
  }
};

export { errorInterceptor, requestInterceptor, responseInterceptor };
