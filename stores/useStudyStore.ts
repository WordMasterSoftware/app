import { create } from 'zustand';
import { studyApi, StudyWord } from '@/api/study';

interface PendingCheckWord {
  wordId: string;
  insertIndex: number;
  checkCount: number;
}

interface StudyState {
  mode: string | null;
  collectionId: string | null;
  sessionId: string | null;
  learningQueue: StudyWord[];
  currentIndex: number;
  pendingCheckWords: PendingCheckWord[];

  totalCount: number;
  correctCount: number;
  incorrectCount: number;
  skipCount: number;

  isLoading: boolean;
  error: string | null;

  startStudySession: (collectionId: string, mode: string) => Promise<void>;
  submitAnswer: (itemId: string, userInput: string, isSkip?: boolean) => Promise<any>;
  nextWord: () => void;
  previousWord: () => void;
  getCurrentWord: () => StudyWord | null;
  isSessionComplete: () => boolean;
  getProgress: () => { current: number; total: number; percentage: number };
  reset: () => void;
}

const useStudyStore = create<StudyState>((set, get) => ({
  mode: null,
  collectionId: null,
  sessionId: null,
  learningQueue: [],
  currentIndex: 0,
  pendingCheckWords: [],

  totalCount: 0,
  correctCount: 0,
  incorrectCount: 0,
  skipCount: 0,

  isLoading: false,
  error: null,

  startStudySession: async (collectionId, mode) => {
    set({ isLoading: true, error: null });
    try {
      const response: any = await studyApi.getSession(collectionId, mode);

      // Ensure words is an array
      const words = response.words || [];

      set({
        mode,
        collectionId,
        sessionId: response.session_id,
        learningQueue: words,
        currentIndex: 0,
        totalCount: response.total_count || words.length,
        correctCount: 0,
        incorrectCount: 0,
        skipCount: 0,
        pendingCheckWords: [],
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        error: error.message || '加载学习会话失败',
        isLoading: false,
      });
      throw error;
    }
  },

  submitAnswer: async (itemId, userInput, isSkip = false) => {
    try {
      const result: any = await studyApi.submitAnswer(itemId, userInput, isSkip);

      if (isSkip) {
        set({ skipCount: get().skipCount + 1 });
      } else {
        if (result.correct) {
          set({ correctCount: get().correctCount + 1 });
        } else {
          set({ incorrectCount: get().incorrectCount + 1 });
        }
      }

      // Double Check Logic:
      // If correct and status changed to 1 (Pending Check)
      if (result.correct && result.current_status === 1) {
        const { currentIndex, learningQueue, pendingCheckWords } = get();
        const currentWord = learningQueue[currentIndex];

        if (currentWord) {
          // Insert 3 steps later, but max at queue length
          const insertIndex = Math.min(currentIndex + 3, learningQueue.length);

          set({
            pendingCheckWords: [
              ...pendingCheckWords,
              {
                wordId: currentWord.word_id,
                insertIndex,
                checkCount: 0,
              },
            ],
          });
        }
      }
      return result;
    } catch (error: any) {
      console.error('Submit answer error:', error);
      throw error;
    }
  },

  nextWord: () => {
    const { currentIndex, pendingCheckWords, learningQueue } = get();

    // Check if any pending words need to be inserted at the NEXT index (currentIndex + 1)
    const wordsToInsert = pendingCheckWords.filter(
      (w) => w.insertIndex === currentIndex + 1
    );

    if (wordsToInsert.length > 0) {
      const newQueue = [...learningQueue];

      wordsToInsert.forEach((w) => {
        const word = learningQueue.find((word) => word.word_id === w.wordId);
        if (word) {
          const recheckWord = {
            ...word,
            isRecheck: true,
            checkCount: w.checkCount + 1,
            _uniqueKey: `${word.word_id}_recheck_${Date.now()}` // Ensure unique key for React lists
          };
          newQueue.splice(currentIndex + 1, 0, recheckWord);
        }
      });

      set({
        learningQueue: newQueue,
        pendingCheckWords: pendingCheckWords.filter(
          (w) => w.insertIndex !== currentIndex + 1
        ),
      });
    }

    set({ currentIndex: currentIndex + 1 });
  },

  previousWord: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  getCurrentWord: () => {
    const { learningQueue, currentIndex } = get();
    return learningQueue[currentIndex] || null;
  },

  isSessionComplete: () => {
    const { currentIndex, learningQueue } = get();
    // Complete if index is past the last element and queue is not empty (or if empty and initialized)
    // Actually, if queue is empty, it's technically complete or error.
    // Usually: currentIndex starts at 0. If length is 5. Max index is 4.
    // When nextWord() is called at index 4, currentIndex becomes 5. 5 >= 5 is true.
    return learningQueue.length > 0 && currentIndex >= learningQueue.length;
  },

  getProgress: () => {
    const { currentIndex, learningQueue } = get();
    const total = learningQueue.length;
    const current = Math.min(currentIndex, total);
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    return { current, total, percentage };
  },

  reset: () => {
    set({
      mode: null,
      collectionId: null,
      sessionId: null,
      learningQueue: [],
      currentIndex: 0,
      pendingCheckWords: [],
      totalCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      skipCount: 0,
      isLoading: false,
      error: null,
    });
  },
}));

export default useStudyStore;
