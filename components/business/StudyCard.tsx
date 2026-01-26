import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { StudyWord } from '@/api/study';
import Card from '../common/Card';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface StudyCardProps {
  word: StudyWord;
  isFlipped: boolean;
  isCorrect?: boolean | null;
}

const StudyCard: React.FC<StudyCardProps> = ({ word, isFlipped, isCorrect }) => {
  const spin = useSharedValue(0);

  useEffect(() => {
    spin.value = withSpring(isFlipped ? 1 : 0, {
      damping: 15,
      stiffness: 90,
    });
  }, [isFlipped]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(spin.value, [0, 1], [0, 180]);
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
      ],
      opacity: interpolate(spin.value, [0, 0.5, 0.51, 1], [1, 1, 0, 0]),
      zIndex: spin.value < 0.5 ? 1 : 0,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(spin.value, [0, 1], [180, 360]);
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
      ],
      opacity: interpolate(spin.value, [0, 0.5, 0.51, 1], [0, 0, 1, 1]),
      zIndex: spin.value < 0.5 ? 0 : 1,
    };
  });

  // Background color based on correctness
  let backBgColor = 'bg-blue-600 dark:bg-blue-800'; // Default review
  if (isCorrect === true) {
    backBgColor = 'bg-green-600 dark:bg-green-800';
  } else if (isCorrect === false) {
    backBgColor = 'bg-red-600 dark:bg-red-800';
  }

  return (
    <View className="flex-1 items-center justify-center p-4">
      <View className="w-full aspect-[4/5] max-h-[400px] relative">
        {/* Front Side (Chinese) */}
        <Animated.View
          style={[styles.card, frontAnimatedStyle]}
          className="absolute inset-0 bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl items-center justify-center p-6"
        >
          <Text className="text-gray-400 text-sm absolute top-6 left-6 font-medium">
            {word.part_of_speech}
          </Text>

          <View className="items-center">
            <Text className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-4">
              {word.chinese}
            </Text>
            {word.isRecheck && (
              <View className="bg-yellow-100 dark:bg-yellow-900 px-3 py-1 rounded-full">
                <Text className="text-yellow-700 dark:text-yellow-400 text-xs font-bold">
                  再次巩固
                </Text>
              </View>
            )}
          </View>

          <View className="absolute bottom-6">
             <FontAwesome name="headphones" size={24} color="#9ca3af" />
          </View>
        </Animated.View>

        {/* Back Side (English + Details) */}
        <Animated.View
          style={[styles.card, backAnimatedStyle]}
          className={`absolute inset-0 rounded-3xl shadow-xl items-center justify-center p-6 ${backBgColor}`}
        >
          <Text className="text-white/70 text-sm absolute top-6 left-6 font-medium">
            {word.part_of_speech}
          </Text>

          <View className="items-center w-full">
            <Text className="text-4xl font-bold text-white text-center mb-2">
              {word.word}
            </Text>
            <Text className="text-white/80 text-lg mb-6 font-mono">
              {word.phonetic}
            </Text>

            <View className="w-full bg-white/10 p-4 rounded-xl">
               <Text className="text-white/90 text-center italic">
                 {word.sentences && word.sentences[0] ? word.sentences[0].replace(new RegExp(word.word, 'gi'), '____') : ''}
               </Text>
               <Text className="text-white/60 text-center text-xs mt-2">
                 {word.chinese}
               </Text>
            </View>
          </View>

          {isCorrect === true && (
             <View className="absolute bottom-6 bg-white/20 px-4 py-1 rounded-full">
                <Text className="text-white font-bold">正确</Text>
             </View>
          )}
          {isCorrect === false && (
             <View className="absolute bottom-6 bg-white/20 px-4 py-1 rounded-full">
                <Text className="text-white font-bold">错误</Text>
             </View>
          )}
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backfaceVisibility: 'hidden',
  },
});

export default StudyCard;
