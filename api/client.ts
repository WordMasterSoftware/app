import axios from 'axios';
import useConfigStore from '../stores/useConfigStore';
import useAuthStore from '../stores/useAuthStore';
import { router } from 'expo-router';
import { Alert } from 'react-native';

const instance = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
instance.interceptors.request.use(
  async (config) => {
    // 1. Get Base URL from Store
    const baseURL = useConfigStore.getState().baseURL;
    if (baseURL) {
      config.baseURL = baseURL;
    }

    // 2. Get Token from Store (Memory)
    // Note: ensure useAuthStore.getState().loadToken() is called at app launch
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Token expired or invalid
          useAuthStore.getState().logout();
          // Navigate to login
          // We can't use router directly outside of a component usually, but expo-router allows it
          // However, to be safe, we might just rely on the store state change to trigger a redirect in the UI
          // Or show an alert
          Alert.alert('登录过期', '请重新登录', [
             { text: 'OK', onPress: () => router.replace('/auth/login') }
          ]);
          break;

        case 403:
          Alert.alert('无权限', '您没有权限执行此操作');
          break;

        case 404:
          // Optional: Don't alert on 404s if they are expected in some flows
          console.warn('Resource not found');
          break;

        case 500:
          Alert.alert('服务器错误', '请稍后重试');
          break;

        default:
          Alert.alert('错误', data?.message || '请求失败');
      }
    } else if (error.request) {
      Alert.alert('网络错误', '无法连接到服务器，请检查网络或配置');
    } else {
      console.error('Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

export const apiClient = instance;
