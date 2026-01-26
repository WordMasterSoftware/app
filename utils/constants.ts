export const STUDY_MODES = {
  NEW: 'new',
  REVIEW: 'review',
  RANDOM: 'random',
  FINAL: 'final',
} as const;

export const WORD_STATUS = {
  NEW: 0,
  PENDING_CHECK: 1,
  REVIEWING: 2,
  MASTERED: 3,
  COMPLETED: 4,
} as const;

export const WORD_STATUS_LABELS = {
  [WORD_STATUS.NEW]: '新词',
  [WORD_STATUS.PENDING_CHECK]: '待检验',
  [WORD_STATUS.REVIEWING]: '复习中',
  [WORD_STATUS.MASTERED]: '已掌握',
  [WORD_STATUS.COMPLETED]: '已完成',
};

// Simple color mapping for React Native (Tailwind classes)
export const WORD_STATUS_COLORS = {
  [WORD_STATUS.NEW]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  [WORD_STATUS.PENDING_CHECK]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  [WORD_STATUS.REVIEWING]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  [WORD_STATUS.MASTERED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  [WORD_STATUS.COMPLETED]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

export const EXAM_MODES = {
  REVIEW: 'review',
  TEST: 'test',
} as const;

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export const WORDBOOK_ICONS = [
  '📚', '🎓', '📝', '🗣️', '🔥', '⭐', '🎯', '🚀'
];

export const WORDBOOK_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
];

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

export const API_TIMEOUT = 30000;
export const TOAST_DURATION = 3000;
export const DEBOUNCE_DELAY = 500;
