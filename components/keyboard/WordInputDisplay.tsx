import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { cn } from '../../utils';

interface WordInputDisplayProps {
  word: string;
  value: string;
  status: 'idle' | 'correct' | 'error';
  isRevealed?: boolean;
}

const WordInputDisplay: React.FC<WordInputDisplayProps> = ({
  word,
  value,
  status,
  isRevealed = false,
}) => {
  // Pad value to match word length for display
  const chars = word.split('');

  // Animation for cursor blink
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View className="flex-row flex-wrap justify-center gap-2 mb-8 px-4">
      {chars.map((char, index) => {
        const isCurrentIndex = index === value.length;
        const inputValue = value[index];
        const isTyped = inputValue !== undefined;

        let borderColor = 'border-gray-300 dark:border-gray-600';
        let textColor = 'text-gray-900 dark:text-white';
        let bgColor = 'bg-white dark:bg-slate-800';

        if (status === 'error') {
          borderColor = 'border-red-500';
          textColor = 'text-red-500';
          bgColor = 'bg-red-50 dark:bg-red-900/20';
        } else if (status === 'correct') {
          borderColor = 'border-green-500';
          textColor = 'text-green-500';
          bgColor = 'bg-green-50 dark:bg-green-900/20';
        } else if (isCurrentIndex) {
          borderColor = 'border-blue-500';
        }

        // Revealed mode (when user skips or gets it wrong eventually)
        if (isRevealed) {
           borderColor = 'border-gray-300 dark:border-gray-600';
           if (!isTyped) {
             textColor = 'text-blue-500'; // Missing letters shown in blue
           } else if (inputValue.toLowerCase() !== char.toLowerCase()) {
             textColor = 'text-red-500'; // Wrong letters in red
           } else {
             textColor = 'text-green-500'; // Correct letters in green
           }
        }

        return (
          <View
            key={index}
            className={cn(
              "w-10 h-12 border-b-2 items-center justify-center relative",
              borderColor,
              bgColor,
              "rounded-t-md"
            )}
          >
            <Text className={cn("text-2xl font-bold", textColor)}>
              {isRevealed
                ? char
                : (isTyped ? inputValue : '')}
            </Text>

            {/* Cursor */}
            {status === 'idle' && isCurrentIndex && !isRevealed && (
              <Animated.View
                className="absolute bottom-1 w-full h-0.5 bg-blue-500"
                style={{ opacity: fadeAnim }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

export default WordInputDisplay;
