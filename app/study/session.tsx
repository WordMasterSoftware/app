import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import useStudyStore from '@/stores/useStudyStore';
import StudyCard from '@/components/business/StudyCard';
import WordInputDisplay from '@/components/keyboard/WordInputDisplay';
import VirtualKeyboard from '@/components/keyboard/VirtualKeyboard';
import Button from '@/components/common/Button';

export default function StudySessionScreen() {
  const { collection_id, mode } = useLocalSearchParams();
  const router = useRouter();
  const {
    startStudySession,
    getCurrentWord,
    submitAnswer,
    nextWord,
    isLoading,
    isSessionComplete,
    getProgress,
    reset
  } = useStudyStore();

  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'error'>('idle');
  const [isFlipped, setIsFlipped] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false); // When user gives up or gets wrong
  const [sound, setSound] = useState<Audio.Sound>();

  // Init session
  useEffect(() => {
    if (collection_id && mode && typeof collection_id === 'string' && typeof mode === 'string') {
      startStudySession(collection_id, mode).catch((err) => {
        Alert.alert('错误', err.message, [{ text: '返回', onPress: () => router.back() }]);
      });
    }
    return () => {
      reset(); // Cleanup on unmount
      if (sound) sound.unloadAsync();
    };
  }, [collection_id, mode]);

  const currentWord = getCurrentWord();
  const progress = getProgress();

  // Play audio when word changes or manually triggered
  useEffect(() => {
    if (currentWord?.audio_url) {
      // playSound(currentWord.audio_url);
    }
    // Reset state for new word
    setInput('');
    setStatus('idle');
    setIsFlipped(false);
    setIsRevealed(false);
  }, [currentWord?.word_id]); // Use word_id to detect change

  async function playSound(url: string) {
    // Implementation for sound
    // const { sound } = await Audio.Sound.createAsync({ uri: url });
    // setSound(sound);
    // await sound.playAsync();
  }

  const handleKeyPress = (key: string) => {
    if (status !== 'idle' || isRevealed) return; // Block input if checking or revealed
    if (input.length < (currentWord?.word.length || 0)) {
      setInput((prev) => prev + key.toLowerCase());
    }
  };

  const handleDelete = () => {
    if (status !== 'idle' || isRevealed) return;
    setInput((prev) => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (!currentWord) return;

    // Check locally first for immediate feedback
    if (input.toLowerCase() === currentWord.word.toLowerCase()) {
      setStatus('correct');
      setIsFlipped(true); // Flip to show details

      // Call API
      try {
        await submitAnswer(currentWord.item_id, input, false);
        // Wait a bit then next
        setTimeout(() => {
          if (isSessionComplete()) {
             // Navigate to result
             router.replace('/(tabs)/study'); // Temporary: back to list
             Alert.alert('完成', '本次学习已完成！');
          } else {
             nextWord();
          }
        }, 1500);
      } catch (err) {
        Alert.alert('提交失败', '网络错误，请重试');
        setStatus('idle');
      }
    } else {
      setStatus('error');
      // Shake animation could be triggered here
      setTimeout(() => setStatus('idle'), 500); // Reset status to allow retry
    }
  };

  const handleSkip = async () => {
    if (!currentWord) return;

    setIsRevealed(true);
    setStatus('error'); // Show red
    setIsFlipped(true); // Show answer

    try {
      await submitAnswer(currentWord.item_id, '', true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNextAfterReveal = () => {
    if (isSessionComplete()) {
      router.replace('/(tabs)/study');
      Alert.alert('完成', '本次学习已完成！');
    } else {
      nextWord();
    }
  };

  if (isLoading || !currentWord) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-500 mt-4">正在加载学习内容...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
      {/* Header / Progress */}
      <View className="px-4 py-2 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="close" size={24} color="#9ca3af" />
        </TouchableOpacity>
        <View className="flex-1 mx-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <View
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${progress.percentage}%` }}
          />
        </View>
        <Text className="text-gray-500 font-mono">
          {progress.current + 1}/{progress.total}
        </Text>
      </View>

      {/* Main Card Area */}
      <View className="flex-1">
        <StudyCard
          word={currentWord}
          isFlipped={isFlipped}
          isCorrect={status === 'correct' ? true : (status === 'error' && isRevealed ? false : null)}
        />
      </View>

      {/* Controls Area */}
      <View className="bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-gray-800 rounded-t-3xl shadow-lg">
        {/* Input Display */}
        <View className="pt-6">
          <WordInputDisplay
            word={currentWord.word}
            value={input}
            status={status}
            isRevealed={isRevealed}
          />
        </View>

        {/* Keyboard or Next Button */}
        {isRevealed || status === 'correct' ? (
           <View className="p-6 pb-12">
             <Button
               variant={status === 'correct' ? 'success' : 'primary'}
               size="lg"
               fullWidth
               onPress={handleNextAfterReveal}
             >
               {isSessionComplete() ? '完成学习' : '下一个'}
             </Button>
           </View>
        ) : (
          <>
            {/* Skip Link */}
            <View className="items-center mb-2">
              <TouchableOpacity onPress={handleSkip}>
                <Text className="text-gray-400 text-sm">不知道？查看答案</Text>
              </TouchableOpacity>
            </View>

            <VirtualKeyboard
              onKeyPress={handleKeyPress}
              onDelete={handleDelete}
              onSubmit={handleSubmit}
              isSubmitEnabled={input.length === currentWord.word.length}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
