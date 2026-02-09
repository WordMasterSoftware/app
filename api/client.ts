import axios from 'axios';
import useConfigStore from '../stores/useConfigStore';
import useAuthStore from '../stores/useAuthStore';
import useAlertStore from '../stores/useAlertStore';
import { router } from 'expo-router';

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
    const { showAlert } = useAlertStore.getState();

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Token expired or invalid
          useAuthStore.getState().logout();
          showAlert('登录过期', '请重新登录', [
            { text: '好的', onPress: () => router.replace('/auth/login') }
          ]);
          break;

        case 403:
          showAlert('无权限', '您没有权限执行此操作', [
            { text: '好的', onPress: () => useAlertStore.getState().hideAlert() }
          ]);
          break;

        case 404:
          // Optional: Don't alert on 404s if they are expected in some flows
          console.warn('Resource not found');
          break;

        case 500:
          showAlert('服务器错误', '请稍后重试', [
            { text: '好的', onPress: () => useAlertStore.getState().hideAlert() }
          ]);
          break;

        default:
          showAlert('错误', data?.message || '请求失败', [
            { text: '好的', onPress: () => useAlertStore.getState().hideAlert() }
          ]);
      }
    } else if (error.request) {
      showAlert('网络错误', '无法连接到服务器，请检查网络或配置', [
        { text: '好的', onPress: () => useAlertStore.getState().hideAlert() }
      ]);
    } else {
      console.error('Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

export const apiClient = instance;
