import { apiClient } from './client';

export interface Collection {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  word_count?: number;
  created_at?: string;
}

export interface CreateCollectionData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface WordItem {
  id: string; // This is the wordbook ID for the word
  word: string;
  phonetic?: string;
  chinese?: string;
  part_of_speech?: string;
  item_id?: string; // This is the user_word_items ID
  status?: number;
  next_review_at?: string;
}

export const collectionsApi = {
  create: (data: CreateCollectionData) => {
    return apiClient.post('/api/collections', data);
  },

  getList: (params: { page?: number; page_size?: number } = {}) => {
    return apiClient.get('/api/collections', { params });
  },

  getDetail: (collectionId: string) => {
    return apiClient.get(`/api/collections/${collectionId}`);
  },

  update: (collectionId: string, data: CreateCollectionData) => {
    return apiClient.put(`/api/collections/${collectionId}`, data);
  },

  delete: (collectionId: string) => {
    return apiClient.delete(`/api/collections/${collectionId}`);
  },

  importWords: (collectionId: string, words: string[]) => {
    return apiClient.post(`/api/collections/${collectionId}/import`, {
      collection_id: collectionId,
      words: words
    });
  },

  getWords: (collectionId: string, params: { page?: number; page_size?: number } = {}) => {
    return apiClient.get(`/api/collections/${collectionId}/words`, { params });
  },
};

export const itemsApi = {
  getDetail: (itemId: string) => {
    return apiClient.get(`/api/items/${itemId}`);
  },

  delete: (itemId: string) => {
    return apiClient.delete(`/api/items/${itemId}`);
  },
};
