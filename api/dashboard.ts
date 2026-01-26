import { apiClient } from './client';

export interface DashboardStats {
  total_words: number;
  total_collections: number;
  today_learned: number;
  to_review: number;
}

export const dashboardApi = {
  /**
   * Get dashboard statistics
   */
  getStats: () => {
    return apiClient.get<any, DashboardStats>('/api/dashboard/stats');
  },
};
