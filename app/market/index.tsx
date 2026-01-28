import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import useMarketStore, { MarketItem } from '@/stores/useMarketStore';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import GlassView from '@/components/common/GlassView';

export default function MarketScreen() {
  const router = useRouter();
  const { items, isLoading, error, fetchMarketItems, importItem, importingId } = useMarketStore();

  useEffect(() => {
    fetchMarketItems();
  }, []);

  const handleImport = async (item: MarketItem) => {
    try {
      await importItem(item);
      Alert.alert(
        '导入成功',
        `"${item.name}" 已添加到你的单词本`,
        [
          { text: '留在这里', style: 'cancel' },
          { text: '去查看', onPress: () => router.dismiss() } // Go back to tabs (likely study tab)
        ]
      );
    } catch (e) {
      Alert.alert('导入失败', '请稍后重试');
    }
  };

  const renderItem = ({ item }: { item: MarketItem }) => (
    <Card className="mb-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800">
      <View className="flex-row items-start p-4">
        <View
          className="w-16 h-16 rounded-xl items-center justify-center mr-4 shadow-sm"
          style={{ backgroundColor: item.color || '#e0e7ff' }}
        >
          <Text className="text-3xl">{item.icon || '📦'}</Text>
        </View>

        <View className="flex-1">
          <View className="flex-row justify-between items-start">
            <Text className="text-lg font-bold text-gray-900 dark:text-white flex-1 mr-2">
              {item.name}
            </Text>
            <View className="bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">
              <Text className="text-xs text-gray-500">{item.word_count} 词</Text>
            </View>
          </View>

          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-2" numberOfLines={2}>
            {item.description}
          </Text>

          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-row flex-wrap gap-2">
              {item.tags?.slice(0, 3).map((tag, idx) => (
                <View key={idx} className="bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                  <Text className="text-[10px] text-blue-600 dark:text-blue-400">#{tag}</Text>
                </View>
              ))}
            </View>

            <Button
              size="sm"
              variant={importingId === item.id ? 'ghost' : 'primary'}
              loading={importingId === item.id}
              disabled={!!importingId}
              onPress={() => handleImport(item)}
              className={importingId === item.id ? '' : "shadow-sm shadow-blue-500/30 px-4"}
            >
              {importingId === item.id ? '导入中...' : '获取'}
            </Button>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-slate-950">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <FontAwesome name="close" size={20} color="#64748b" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            单词市场
          </Text>
          <View className="w-8" />
        </View>

        {/* Content */}
        {isLoading && items.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-gray-500 mt-4">正在加载市场数据...</Text>
          </View>
        ) : error ? (
           <View className="flex-1 items-center justify-center p-8">
            <FontAwesome name="warning" size={48} color="#ef4444" />
            <Text className="text-gray-900 dark:text-white font-bold text-lg mt-4 mb-2">加载失败</Text>
            <Text className="text-gray-500 text-center mb-6">{error}</Text>
            <Button onPress={fetchMarketItems} variant="outline">重试</Button>
          </View>
        ) : (
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerClassName="p-4 pb-12"
            refreshing={isLoading}
            onRefresh={fetchMarketItems}
            ListEmptyComponent={
              <View className="items-center py-12">
                <Text className="text-gray-400">暂无内容</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}
