import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAudioPlayer } from 'expo-audio';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  SlideInDown
} from 'react-native-reanimated';

import useStudyStore from '@/stores/useStudyStore';
import StudyCard from '@/components/business/StudyCard';
import WordInputDisplay from '@/components/keyboard/WordInputDisplay';
import VirtualKeyboard from '@/components/keyboard/VirtualKeyboard';
import Button from '@/components/common/Button';
import GlassView from '@/components/common/GlassView';

export default function StudySessionScreen() {
  const { collection_id, mode } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
  const [isRevealed, setIsRevealed] = useState(false);

  // Audio Player
  const player = useAudioPlayer(getCurrentWord()?.audio_url || '');

  // Animation values
  const contentOpacity = useSharedValue(0);

  // Init session
  useEffect(() => {
    if (collection_id && mode && typeof collection_id === 'string' && typeof mode === 'string') {
      startStudySession(collection_id, mode)
        .then(() => {
          contentOpacity.value = withTiming(1, { duration: 500 });
        })
        .catch((err) => {
          Alert.alert('错误', err.message, [{ text: '返回', onPress: () => router.back() }]);
        });
    }
    return () => {
      reset();
    };
  }, [collection_id, mode]);

  const currentWord = getCurrentWord();
  const progress = getProgress();

  // Play audio when word changes
  useEffect(() => {
    if (currentWord?.audio_url) {
       player.replace(currentWord.audio_url);
       player.play();
    }
    // Reset state for new word
    setInput('');
    setStatus('idle');
    setIsFlipped(false);
    setIsRevealed(false);
  }, [currentWord?.word_id]);

  // Removed old playSound function


  const handleKeyPress = (key: string) => {
    if (status !== 'idle' || isRevealed) return;
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

    if (input.toLowerCase() === currentWord.word.toLowerCase()) {
      // Correct
      setStatus('correct');
      setIsFlipped(true);

      try {
        await submitAnswer(currentWord.item_id, input, false);
        // Delay next word slightly to show success state
        setTimeout(() => {
          if (isSessionComplete()) {
             Alert.alert('🎉 完成', '本次学习已完成！', [
               { text: '确定', onPress: () => router.replace('/(tabs)/study') }
             ]);
          } else {
             nextWord();
          }
        }, 1500);
      } catch (err) {
        Alert.alert('提交失败', '网络错误');
        setStatus('idle');
      }
    } else {
      // Incorrect
      setStatus('error');
      // Simple shake effect via status prop in WordInputDisplay
      setTimeout(() => setStatus('idle'), 500);
    }
  };

  const handleSkip = async () => {
    if (!currentWord) return;

    setIsRevealed(true);
    setStatus('error');
    setIsFlipped(true);

    try {
      await submitAnswer(currentWord.item_id, '', true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNextAfterReveal = () => {
    if (isSessionComplete()) {
      Alert.alert('🎉 完成', '本次学习已完成！', [
        { text: '确定', onPress: () => router.replace('/(tabs)/study') }
      ]);
    } else {
      nextWord();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  if (isLoading || !currentWord) {
    return (
      <View className="flex-1 bg-white dark:bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-500 mt-4 font-medium">准备学习内容...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 dark:bg-slate-950">
      {/* Background Gradient or Image could go here */}
      <View className="absolute inset-0 bg-blue-50 dark:bg-slate-900" />

      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="px-4 h-14 flex-row items-center justify-between z-10">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 items-center justify-center shadow-sm"
          >
            <FontAwesome name="close" size={18} color="#64748b" />
          </TouchableOpacity>

          <View className="flex-1 mx-6">
            <View className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <Animated.View
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${progress.percentage}%` }}
              />
            </View>
          </View>

          <View className="px-3 py-1 bg-white dark:bg-slate-800 rounded-full shadow-sm">
             <Text className="text-xs font-bold text-slate-600 dark:text-slate-300">
               {progress.current + 1} / {progress.total}
             </Text>
          </View>
        </View>

        {/* Main Content */}
        <Animated.View style={[{ flex: 1 }, animatedStyle]}>
          <View className="flex-1 justify-center items-center px-6 py-4">
            <StudyCard
              word={currentWord}
              isFlipped={isFlipped}
              isCorrect={status === 'correct' ? true : (status === 'error' && isRevealed ? false : null)}
            />
          </View>

          {/* Input & Keyboard Section */}
          <GlassView
            intensity={90}
            tint="light"
            className="rounded-t-3xl border-t border-white/20 shadow-2xl"
            style={{ paddingBottom: insets.bottom }}
          >
            <View className="pt-6 pb-2">
              <WordInputDisplay
                word={currentWord.word}
                value={input}
                status={status}
                isRevealed={isRevealed}
              />
            </View>

            {isRevealed || status === 'correct' ? (
              <Animated.View
                entering={SlideInDown.duration(300)}
                className="px-6 pt-2 pb-8"
              >
                <Button
                  variant={status === 'correct' ? 'success' : 'primary'}
                  size="lg"
                  fullWidth
                  onPress={handleNextAfterReveal}
                  className="shadow-lg shadow-blue-500/30"
                >
                  <View className="flex-row items-center justify-center">
                    <Text className="text-white font-bold text-lg mr-2">
                      {isSessionComplete() ? '完成学习' : '下一个'}
                    </Text>
                    <FontAwesome name="arrow-right" size={18} color="white" />
                  </View>
                </Button>
              </Animated.View>
            ) : (
              <Animated.View entering={FadeIn}>
                <View className="items-center -mt-2 mb-2">
                   <TouchableOpacity onPress={handleSkip} className="py-2 px-4">
                     <Text className="text-slate-400 font-medium text-sm">不知道? 查看答案</Text>
                   </TouchableOpacity>
                </View>

                <VirtualKeyboard
                  onKeyPress={handleKeyPress}
                  onDelete={handleDelete}
                  onSubmit={handleSubmit}
                  isSubmitEnabled={input.length === currentWord.word.length}
                />
              </Animated.View>
            )}
          </GlassView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
