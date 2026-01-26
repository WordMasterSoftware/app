import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import useCollectionStore from '@/stores/useCollectionStore';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import GlassView from '@/components/common/GlassView';

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const {
    currentCollection,
    words,
    fetchCollectionDetail,
    fetchWords,
    deleteCollection,
    isLoading
  } = useCollectionStore();

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchCollectionDetail(id);
      fetchWords(id);
    }
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      '删除单词本',
      '确定要删除这个单词本吗？所有学习记录将无法恢复。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              if (typeof id === 'string') {
                await deleteCollection(id);
                router.back();
              }
            } catch (error) {
              Alert.alert('删除失败', '请稍后重试');
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  const handleStartStudy = (mode: 'new' | 'review') => {
    router.push(`/study/session?collection_id=${id}&mode=${mode}`);
  };

  if (!currentCollection && isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-slate-950">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!currentCollection) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-slate-950">
        <Text className="text-gray-500">未找到单词本</Text>
        <Button variant="ghost" onPress={() => router.back()} className="mt-4">
          返回列表
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-slate-950">
      <ScrollView contentContainerClassName="pb-24">
        {/* Header Area with Custom Color */}
        <View
          className="w-full h-64 relative"
          style={{ backgroundColor: currentCollection.color || '#3b82f6' }}
        >
          <SafeAreaView className="flex-1">
            <View className="px-4 py-2 flex-row justify-between items-center z-10">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 bg-black/10 rounded-full items-center justify-center"
              >
                <FontAwesome name="arrow-left" size={20} color="white" />
              </TouchableOpacity>

              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => router.push(`/collection/import?id=${id}`)}
                  className="w-10 h-10 bg-black/10 rounded-full items-center justify-center"
                >
                  <FontAwesome name="plus" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDelete}
                  className="w-10 h-10 bg-black/10 rounded-full items-center justify-center"
                >
                  <FontAwesome name="trash-o" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-1 items-center justify-center -mt-10">
              <Text className="text-6xl mb-4">{currentCollection.icon || '📚'}</Text>
              <Text className="text-3xl font-bold text-white text-center px-6 shadow-sm">
                {currentCollection.name}
              </Text>
              <Text className="text-white/80 mt-2 text-center px-8">
                {currentCollection.description || '暂无描述'}
              </Text>
            </View>
          </SafeAreaView>

          {/* Curve / Shape Divider */}
          <View className="absolute bottom-0 left-0 right-0 h-6 bg-gray-50 dark:bg-slate-950 rounded-t-3xl" />
        </View>

        {/* Content */}
        <View className="px-6 -mt-2">
          {/* Stats Card */}
          <View className="flex-row space-x-4 mb-6">
            <Card className="flex-1 items-center py-4 bg-white/90 dark:bg-slate-800/90">
              <Text className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentCollection.word_count || 0}
              </Text>
              <Text className="text-xs text-gray-500 mt-1">总单词</Text>
            </Card>
            <Card className="flex-1 items-center py-4 bg-white/90 dark:bg-slate-800/90">
              <Text className="text-3xl font-bold text-green-600 dark:text-green-400">
                0%
              </Text>
              <Text className="text-xs text-gray-500 mt-1">掌握率</Text>
            </Card>
          </View>

          {/* Action Buttons */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            className="mb-3 shadow-lg shadow-blue-500/30"
            onPress={() => handleStartStudy('new')}
          >
            <View className="flex-row items-center">
              <FontAwesome name="play" size={16} color="white" className="mr-2" />
              <Text className="text-white font-bold text-lg">开始学习</Text>
            </View>
          </Button>

          <Button
            variant="secondary"
            fullWidth
            className="mb-8"
            onPress={() => handleStartStudy('review')}
          >
            复习本组单词
          </Button>

          {/* Word List Preview */}
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            单词预览
          </Text>

          <View className="space-y-3">
            {words.length > 0 ? (
              words.map((word) => (
                <View
                  key={word.id}
                  className="flex-row items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800"
                >
                  <View>
                    <Text className="text-lg font-bold text-gray-900 dark:text-white">
                      {word.word}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      {word.phonetic}
                    </Text>
                  </View>
                  <Text className="text-gray-600 dark:text-gray-300">
                    {word.chinese}
                  </Text>
                </View>
              ))
            ) : (
              <View className="py-8 items-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                <Text className="text-gray-400 mb-4">暂无单词</Text>
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => router.push(`/collection/import?id=${id}`)}
                >
                  导入单词
                </Button>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
