import { create } from 'zustand';
import axios from 'axios';
import { collectionsApi } from '@/api/collections';

export interface MarketItem {
  id: string;
  name: string;
  description: string;
  author: string;
  word_count: number;
  tags: string[];
  url: string; // URL to the JSON file of the wordbook
  icon?: string;
  color?: string;
}

interface MarketState {
  items: MarketItem[];
  isLoading: boolean;
  error: string | null;
  importingId: string | null;

  fetchMarketItems: () => Promise<void>;
  importItem: (item: MarketItem) => Promise<void>;
}

const BASE_URL = 'https://raw.githubusercontent.com/WordMasterSoftware/Marketplace/main/';
const MARKET_INDEX_URL = `${BASE_URL}index.json`;

const useMarketStore = create<MarketState>((set) => ({
  items: [],
  isLoading: false,
  error: null,
  importingId: null,

  fetchMarketItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(MARKET_INDEX_URL);
      // Data structure: { "book": [ { "name": "...", "path": "..." } ] }
      const rawBooks = response.data.book || [];

      const items: MarketItem[] = rawBooks.map((book: any, index: number) => ({
        id: String(index),
        name: book.name,
        description: book.description,
        author: 'Official', // Default
        word_count: 0, // Not in index
        tags: [],
        url: book.path, // Relative path
        icon: '📚',
        color: '#3b82f6'
      }));

      set({ items, isLoading: false });
    } catch (error: any) {
      console.error('Fetch market failed:', error);
      set({
        error: '无法加载市场数据，请检查网络连接',
        isLoading: false
      });
    }
  },

  importItem: async (item: MarketItem) => {
    set({ importingId: item.id });
    try {
      // 1. Create the collection first
      const createRes = await collectionsApi.create({
        name: item.name,
        description: item.description,
        icon: item.icon || '📚',
        color: item.color || '#3b82f6'
      });

      const collectionId = (createRes as any).data.id;

      // 2. Fetch the word list content
      // Construct full URL if it's a relative path
      // Note: The plan says path is relative to wordbook/ sometimes, but let's assume it's relative to root or includes wordbook/
      // Safest is to check if it starts with http
      const fullUrl = item.url.startsWith('http') ? item.url : `${BASE_URL}wordbook/${item.url}`;

      const contentRes = await axios.get(fullUrl);
      const data = contentRes.data;
      const words = Array.isArray(data) ? data : (data.words ? data.words : []);

      // 3. Extract just the words (strings) if the JSON is complex, or simple strings
      // Assuming the market JSON format is [ "word1", "word2" ] or [ { "word": "word1" } ]
      const wordList = words.map((w: any) => typeof w === 'string' ? w : w.word);

      // 4. Import words to the collection
      if (wordList.length > 0) {
        await collectionsApi.importWords(collectionId, wordList);
      }

      set({ importingId: null });
      return collectionId;
    } catch (error: any) {
      console.error('Import failed:', error);
      set({ importingId: null });
      throw error;
    }
  }
}));

export default useMarketStore;
