import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from '../utils/storage';

interface ConfigState {
  baseURL: string;
  isConfigured: boolean;
  setBaseURL: (url: string) => void;
  clearConfig: () => void;
  testConnection: (url?: string) => Promise<boolean>;
}

const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      baseURL: '',
      isConfigured: false,

      setBaseURL: (url: string) => {
        const cleanUrl = url.replace(/\/$/, '');
        set({
          baseURL: cleanUrl,
          isConfigured: true,
        });
      },

      clearConfig: () => {
        set({
          baseURL: '',
          isConfigured: false,
        });
      },

      testConnection: async (url?: string) => {
        const testUrl = url || get().baseURL;
        if (!testUrl) {
          throw new Error('请先配置后端地址');
        }

        try {
          // Use fetch for a simple health check without axios interceptors
          const response = await fetch(`${testUrl}/health`);
          if (response.ok) {
            return true;
          }
          throw new Error('连接失败');
        } catch (error) {
          console.error('Connection test failed:', error);
          throw new Error('无法连接到后端服务');
        }
      },
    }),
    {
      name: 'config-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

export default useConfigStore;
