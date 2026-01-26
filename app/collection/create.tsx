import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import useCollectionStore from '@/stores/useCollectionStore';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { WORDBOOK_COLORS, WORDBOOK_ICONS } from '@/utils/constants';

export default function CreateCollectionScreen() {
  const router = useRouter();
  const { createCollection } = useCollectionStore();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(WORDBOOK_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(WORDBOOK_ICONS[0]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入单词本名称');
      return;
    }

    setLoading(true);
    try {
      await createCollection({
        name,
        description,
        color: selectedColor,
        icon: selectedIcon,
      });
      Alert.alert('成功', '创建成功', [
        { text: '确定', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('创建失败', error.message || '请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <SafeAreaView edges={['top']} className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800">
        <View className="px-4 py-3 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-base text-gray-500">取消</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">新建单词本</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            <Text className={`text-base font-bold ${loading ? 'text-gray-400' : 'text-blue-600'}`}>
              完成
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1 p-4">
        {/* Preview Card */}
        <View className="items-center mb-8 mt-2">
          <View
            className="w-24 h-24 rounded-2xl items-center justify-center shadow-lg mb-3"
            style={{ backgroundColor: selectedColor }}
          >
            <Text className="text-5xl">{selectedIcon}</Text>
          </View>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            {name || '单词本名称'}
          </Text>
        </View>

        <View className="space-y-6">
          <Card>
            <Input
              label="名称"
              placeholder="例如：TOEFL 核心词汇"
              value={name}
              onChangeText={setName}
              maxLength={20}
            />
            <Input
              label="描述（可选）"
              placeholder="例如：备战托福考试专用"
              value={description}
              onChangeText={setDescription}
              maxLength={50}
            />
          </Card>

          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 ml-1">
              选择颜色
            </Text>
            <Card className="p-4">
              <View className="flex-row flex-wrap justify-between gap-y-4">
                {WORDBOOK_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    {selectedColor === color && (
                      <FontAwesome name="check" size={16} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 ml-1">
              选择图标
            </Text>
            <Card className="p-4">
              <View className="flex-row flex-wrap justify-between gap-y-4">
                {WORDBOOK_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    onPress={() => setSelectedIcon(icon)}
                    className={`w-12 h-12 rounded-xl items-center justify-center ${
                      selectedIcon === icon ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                  >
                    <Text className="text-2xl">{icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
