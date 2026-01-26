import { apiClient } from './client';

export interface StudyWord {
  word_id: string;
  item_id: string;
  word: string;
  chinese: string;
  phonetic: string;
  part_of_speech: string;
  sentences: string[];
  status: number;
  audio_url?: string;
  isRecheck?: boolean;
  checkCount?: number;
  _uniqueKey?: string;
  [key: string]: any;
}

export interface StudySessionResponse {
  session_id: string;
  collection_id: string;
  mode: string;
  words: StudyWord[];
  total_count: number;
}

export interface SubmitAnswerResponse {
  success: boolean;
  correct: boolean;
  status_update: string;
  current_status: number;
  next_review_at?: string;
  correct_answer?: string;
}

export const studyApi = {
  /**
   * Get study session data
   * @param collectionId
   * @param mode 'new' | 'review' | 'random' | 'final'
   */
  getSession: (collectionId: string, mode: string) => {
    return apiClient.get('/api/study/session', {
      params: { collection_id: collectionId, mode }
    });
  },

  /**
   * Submit answer for a word
   * @param itemId user_word_items ID (from StudyWord.item_id)
   * @param userInput User's spelling input
   * @param isSkip Whether the user skipped the word
   */
  submitAnswer: (itemId: string, userInput: string, isSkip: boolean = false) => {
    return apiClient.post('/api/study/submit', {
      item_id: itemId,
      user_input: userInput,
      is_skip: isSkip
    });
  }
};
