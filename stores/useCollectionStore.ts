import { create } from 'zustand';
import { collectionsApi, itemsApi, Collection, WordItem, CreateCollectionData } from '@/api/collections';

interface CollectionState {
  collections: Collection[];
  currentCollection: Collection | null;
  words: WordItem[];
  isLoading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  total: number;

  fetchCollections: (page?: number, pageSize?: number, append?: boolean) => Promise<any>;
  fetchCollectionDetail: (collectionId: string) => Promise<void>;
  fetchWords: (collectionId: string, page?: number, pageSize?: number, append?: boolean) => Promise<any>;
  createCollection: (data: CreateCollectionData) => Promise<Collection>;
  updateCollection: (collectionId: string, data: CreateCollectionData) => Promise<Collection>;
  deleteCollection: (collectionId: string) => Promise<void>;
  importWords: (collectionId: string, words: string[]) => Promise<any>;
  deleteWord: (itemId: string) => Promise<void>;
  clearCurrentCollection: () => void;
  reset: () => void;
}

const useCollectionStore = create<CollectionState>((set, get) => ({
  collections: [],
  currentCollection: null,
  words: [],
  isLoading: false,
  error: null,
  page: 1,
  pageSize: 20,
  total: 0,

  fetchCollections: async (page = 1, pageSize = 20, append = false) => {
    if (!append) {
      set({ isLoading: true, error: null });
    }

    try {
      const response: any = await collectionsApi.getList({ page, page_size: pageSize });
      const newCollections = response.collections || [];

      set((state) => ({
        collections: append ? [...state.collections, ...newCollections] : newCollections,
        total: response.total || 0,
        page: response.page || 1,
        pageSize: response.page_size || 20,
        isLoading: false,
      }));

      return response;
    } catch (error: any) {
      set({
        error: error.message || '获取单词本列表失败',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchCollectionDetail: async (collectionId) => {
    set({ isLoading: true, error: null });
    try {
      const collection: any = await collectionsApi.getDetail(collectionId);
      set({
        currentCollection: collection,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || '获取单词本详情失败',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchWords: async (collectionId, page = 1, pageSize = 20, append = false) => {
    if (!append) {
      set({ isLoading: true, error: null });
    }

    try {
      const response: any = await collectionsApi.getWords(collectionId, { page, page_size: pageSize });
      const newWords = response.words || [];

      set((state) => ({
        words: append ? [...state.words, ...newWords] : newWords,
        total: response.total || 0,
        page: response.page || 1,
        pageSize: response.page_size || 20,
        isLoading: false,
      }));

      return response;
    } catch (error: any) {
      set({
        error: error.message || '获取单词列表失败',
        isLoading: false,
      });
      throw error;
    }
  },

  createCollection: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newCollection: any = await collectionsApi.create(data);
      set({
        collections: [newCollection, ...get().collections],
        isLoading: false,
      });
      return newCollection;
    } catch (error: any) {
      set({
        error: error.message || '创建单词本失败',
        isLoading: false,
      });
      throw error;
    }
  },

  updateCollection: async (collectionId, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedCollection: any = await collectionsApi.update(collectionId, data);
      set({
        collections: get().collections.map((c) =>
          c.id === collectionId ? updatedCollection : c
        ),
        currentCollection:
          get().currentCollection?.id === collectionId
            ? updatedCollection
            : get().currentCollection,
        isLoading: false,
      });
      return updatedCollection;
    } catch (error: any) {
      set({
        error: error.message || '更新单词本失败',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteCollection: async (collectionId) => {
    set({ isLoading: true, error: null });
    try {
      await collectionsApi.delete(collectionId);
      set({
        collections: get().collections.filter((c) => c.id !== collectionId),
        currentCollection:
          get().currentCollection?.id === collectionId
            ? null
            : get().currentCollection,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || '删除单词本失败',
        isLoading: false,
      });
      throw error;
    }
  },

  importWords: async (collectionId, words) => {
    set({ isLoading: true, error: null });
    try {
      const result = await collectionsApi.importWords(collectionId, words);
      set({ isLoading: false });
      return result;
    } catch (error: any) {
      set({
        error: error.message || '导入单词失败',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteWord: async (itemId) => {
    set({ isLoading: true, error: null });
    try {
      await itemsApi.delete(itemId);
      set({
        words: get().words.filter((w) => w.item_id !== itemId),
        total: get().total - 1,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || '删除单词失败',
        isLoading: false,
      });
      throw error;
    }
  },

  clearCurrentCollection: () => {
    set({ currentCollection: null, words: [] });
  },

  reset: () => {
    set({
      collections: [],
      currentCollection: null,
      words: [],
      isLoading: false,
      error: null,
      page: 1,
      pageSize: 20,
      total: 0,
    });
  },
}));

export default useCollectionStore;
