import { apiClient } from './client';

export interface LoginData {
  account: string; // username or email
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  nickname?: string;
}

export interface UpdateProfileData {
  nickname?: string;
  avatar_url?: string;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
}

export interface LlmConfigData {
  use_default_llm: boolean;
  llm_api_key?: string;
  llm_base_url?: string;
  llm_model?: string;
}

export const authApi = {
  register: (data: RegisterData) => {
    return apiClient.post('/api/auth/register', data);
  },

  login: (data: LoginData) => {
    return apiClient.post('/api/auth/login', data);
  },

  logout: () => {
    return apiClient.post('/api/auth/logout');
  },

  getCurrentUser: () => {
    return apiClient.get('/api/auth/me');
  },

  updateProfile: (data: UpdateProfileData) => {
    return apiClient.put('/api/auth/profile', data);
  },

  changePassword: (data: ChangePasswordData) => {
    return apiClient.put('/api/auth/password', data);
  },

  getLlmConfig: () => {
    return apiClient.get('/api/auth/llm-config');
  },

  updateLlmConfig: (data: LlmConfigData) => {
    return apiClient.put('/api/auth/llm-config', data);
  },
};
