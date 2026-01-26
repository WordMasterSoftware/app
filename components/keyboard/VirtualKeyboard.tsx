import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  isSubmitEnabled: boolean;
}

const KEYS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onKeyPress,
  onDelete,
  onSubmit,
  isSubmitEnabled,
}) => {
  const windowWidth = Dimensions.get('window').width;
  // Calculate key width based on screen width
  // 10 keys in top row, plus margins
  const keyWidth = (windowWidth - 32 - (9 * 6)) / 10;

  const handlePress = (key: string) => {
    // Light vibration for feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onKeyPress(key);
  };

  const handleDeletePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onDelete();
  };

  const handleSubmitPress = () => {
    if (isSubmitEnabled) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      onSubmit();
    }
  };

  return (
    <View className="w-full bg-gray-100 dark:bg-slate-900 pb-8 pt-2 px-1">
      {/* Keys Rows */}
      {KEYS.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row justify-center mb-3 space-x-1.5">
          {row.map((key) => (
            <TouchableOpacity
              key={key}
              onPress={() => handlePress(key)}
              className="bg-white dark:bg-slate-700 rounded-lg items-center justify-center shadow-sm active:bg-gray-200 dark:active:bg-slate-600"
              style={{ width: keyWidth, height: 44 }}
            >
              <Text className="text-xl font-medium text-gray-900 dark:text-white">
                {key}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Action Row (Delete, Space/Submit) */}
      <View className="flex-row justify-center items-center px-4 mt-1">
         {/* Spacer to align with Z row visually if needed, but here we just put Delete right next to M usually,
             or separate row. Let's do a separate bottom row for special keys like iOS */}

         <View className="flex-1 flex-row justify-between items-center">
            {/* Enter / Submit Button */}
            <TouchableOpacity
              onPress={handleSubmitPress}
              disabled={!isSubmitEnabled}
              className={`h-11 flex-1 mr-4 rounded-lg items-center justify-center shadow-sm ${
                isSubmitEnabled
                  ? 'bg-blue-600 dark:bg-blue-600'
                  : 'bg-gray-300 dark:bg-gray-700 opacity-50'
              }`}
            >
              <Text className="text-white font-bold text-base">提交</Text>
            </TouchableOpacity>

            {/* Backspace Button */}
            <TouchableOpacity
              onPress={handleDeletePress}
              onLongPress={handleDeletePress}
              className="bg-gray-300 dark:bg-gray-700 h-11 w-16 rounded-lg items-center justify-center shadow-sm active:bg-gray-400"
            >
              <FontAwesome name="backspace" size={20} color={Platform.OS === 'ios' ? '#000' : '#333'} />
            </TouchableOpacity>
         </View>
      </View>
    </View>
  );
};

export default VirtualKeyboard;
