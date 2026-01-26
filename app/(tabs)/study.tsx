import React, { useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter, useFocusEffect } from 'expo-router';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import useCollectionStore from '@/stores/useCollectionStore';

export default function StudyScreen() {
  const router = useRouter();
  const { collections, fetchCollections, isLoading } = useCollectionStore();
  const [refreshing, setRefreshing] = React.useState(false);

  // Load data on mount and focus
  useFocusEffect(
    useCallback(() => {
      fetchCollections();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchCollections();
    } finally {
      setRefreshing(false);
    }
  };

  const handleCollectionPress = (id: string) => {
    router.push(`/collection/${id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
      <View className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">单词本</Text>
        <TouchableOpacity
          onPress={() => router.push('/collection/create')}
          className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full items-center justify-center"
        >
          <FontAwesome name="plus" size={14} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerClassName="p-4 pb-24"
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Create / Import Card */}
        <Card className="mb-6 border-dashed border-2 border-gray-300 dark:border-gray-700 bg-transparent shadow-none" hoverable onPress={() => router.push('/collection/create')}>
          <View className="items-center py-4">
            <View className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mb-3">
              <FontAwesome name="plus" size={20} color="#6b7280" />
            </View>
            <Text className="text-base font-medium text-gray-900 dark:text-white">
              新建单词本
            </Text>
          </View>
        </Card>

        {/* Collection List */}
        <View className="space-y-4">
          {collections.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              onPress={() => handleCollectionPress(item.id)}
            >
              <Card className="flex-row items-center p-4">
                <View
                  className="w-14 h-14 rounded-xl items-center justify-center mr-4"
                  style={{ backgroundColor: item.color || '#3b82f6' }}
                >
                  <Text className="text-2xl">{item.icon || '📚'}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 dark:text-white" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1" numberOfLines={1}>
                    {item.description || '暂无描述'}
                  </Text>
                  <View className="flex-row items-center mt-2">
                    <FontAwesome name="files-o" size={12} color="#9ca3af" className="mr-1" />
                    <Text className="text-xs text-gray-400">
                      {item.word_count || 0} 个单词
                    </Text>
                  </View>
                </View>
                <FontAwesome name="chevron-right" size={14} color="#d1d5db" />
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loading State */}
        {isLoading && !refreshing && (
          <View className="py-8">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        )}

        {/* Empty State */}
        {!isLoading && collections.length === 0 && (
          <View className="items-center py-12">
            <FontAwesome name="folder-open-o" size={48} color="#d1d5db" />
            <Text className="text-gray-400 mt-4 text-center">
              还没有单词本，点击上方按钮创建
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
