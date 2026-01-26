import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import useCollectionStore from '@/stores/useCollectionStore';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

export default function ImportWordsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { importWords, fetchWords, fetchCollectionDetail } = useCollectionStore();

  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleImport = async () => {
    if (!text.trim()) {
      Alert.alert('提示', '请输入要导入的单词');
      return;
    }

    // Split by newlines or commas, filter empty
    const words = text
      .split(/[\n,，]/)
      .map(w => w.trim())
      .filter(w => w.length > 0);

    if (words.length === 0) {
      Alert.alert('提示', '未检测到有效单词');
      return;
    }

    setLoading(true);
    try {
      if (typeof id === 'string') {
        const res = await importWords(id, words);
        setResult(res);
        // Refresh data
        await fetchCollectionDetail(id);
        await fetchWords(id);
      }
    } catch (error: any) {
      Alert.alert('导入失败', error.message || '请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-slate-950">
      <SafeAreaView edges={['top']} className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800">
        <View className="px-4 py-3 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-base text-gray-500">取消</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">导入单词</Text>
          <View style={{ width: 30 }} />
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        {!result ? (
          <>
            <View className="mb-4">
              <Text className="text-sm text-gray-500 mb-2">
                请输入要学习的英语单词，每行一个，或用逗号分隔。系统将自动去重并生成释义。
              </Text>
              <View className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 h-64">
                <TextInput
                  className="flex-1 text-base text-gray-900 dark:text-white leading-6"
                  multiline
                  placeholder="apple&#10;banana&#10;cherry"
                  placeholderTextColor="#9ca3af"
                  value={text}
                  onChangeText={setText}
                  textAlignVertical="top"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <Button
              variant="primary"
              loading={loading}
              onPress={handleImport}
              fullWidth
              size="lg"
            >
              开始导入
            </Button>

            {loading && (
              <View className="mt-8 items-center">
                <Text className="text-gray-500 mb-2">正在通过 AI 生成释义...</Text>
                <Text className="text-xs text-gray-400">这可能需要一点时间，请勿关闭页面</Text>
              </View>
            )}
          </>
        ) : (
          <View className="items-center py-8">
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
              <FontAwesome name="check" size={40} color="#10b981" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              导入完成
            </Text>

            <View className="w-full mt-8 flex-row flex-wrap justify-between gap-4">
              <StatsBox label="成功导入" value={result.imported} color="text-green-600" />
              <StatsBox label="AI 生成" value={result.llm_generated} color="text-blue-600" />
              <StatsBox label="已有复用" value={result.reused} color="text-purple-600" />
              <StatsBox label="重复跳过" value={result.duplicates} color="text-gray-500" />
            </View>

            <Button
              variant="primary"
              fullWidth
              className="mt-12"
              onPress={handleFinish}
            >
              完成并查看
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StatsBox({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <View className="w-[47%] bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 items-center">
      <Text className={`text-2xl font-bold ${color}`}>{value}</Text>
      <Text className="text-xs text-gray-500 mt-1">{label}</Text>
    </View>
  );
}
