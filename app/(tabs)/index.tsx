import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import Card from '@/components/common/Card';
import useAuthStore from '@/stores/useAuthStore';
import useCollectionStore from '@/stores/useCollectionStore';
import { dashboardApi, DashboardStats } from '@/api/dashboard';
import { authApi } from '@/api/auth';

export default function HomeScreen() {
  const { user, updateUser } = useAuthStore();
  const { collections, fetchCollections } = useCollectionStore();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    total_words: 0,
    total_collections: 0,
    today_learned: 0,
    to_review: 0,
  });
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const loadData = async () => {
    try {
      const [statsData, userResponse] = await Promise.all([
        dashboardApi.getStats().catch(e => {
          console.error('Stats fetch failed', e);
          return null;
        }),
        authApi.getCurrentUser().catch(e => {
          console.error('User fetch failed', e);
          return null;
        }),
        fetchCollections(1, 3).catch(e => null)
      ]);

      if (statsData) {
        setStats(statsData);
      }

      if (userResponse) {
        const userData = (userResponse as any).data || userResponse;
        if (userData) {
          updateUser(userData);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const actions = [
    { icon: 'book', label: '开始学习', color: 'bg-blue-500', route: '/(tabs)/study' },
    { icon: 'refresh', label: '复习巩固', color: 'bg-blue-400', route: '/(tabs)/review' },
    { icon: 'shopping-cart', label: '单词市场', color: 'bg-indigo-400', route: '/(tabs)/study' },
    { icon: 'envelope', label: '消息中心', color: 'bg-orange-400', route: '/messages' },
  ];

  return (
    <View className="flex-1 bg-white dark:bg-slate-950">
      {/* 1. Fixed Header Section (Blue Background) */}
      <View className="bg-blue-600 pb-16 rounded-b-[20px] z-0 shadow-sm">
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View className="px-6 pt-2">
            {/* User Greeting */}
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-blue-100 text-sm font-medium mb-1">欢迎回来 👋</Text>
                <Text className="text-white text-3xl font-bold tracking-wide">
                  {user?.nickname || user?.username || 'Learner'}
                </Text>
              </View>
              <Link href="/(tabs)/profile" asChild>
                <TouchableOpacity className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center border border-white/10 backdrop-blur-md">
                  <FontAwesome name="user" size={24} color="white" />
                </TouchableOpacity>
              </Link>
            </View>

            {/* Stats Grid */}
            <View className="flex-row justify-between mb-2">
              <View className="items-center flex-1">
                <Text className="text-blue-200 text-xs mb-2 font-medium">今日学习</Text>
                <Text className="text-white text-4xl font-bold">{stats.today_learned}</Text>
              </View>
              <View className="w-[1px] h-12 bg-white/20 self-center" />
              <View className="items-center flex-1">
                <Text className="text-blue-200 text-xs mb-2 font-medium">单词本</Text>
                <Text className="text-white text-4xl font-bold">{stats.total_collections}</Text>
              </View>
              <View className="w-[1px] h-12 bg-white/20 self-center" />
              <View className="items-center flex-1">
                <Text className="text-blue-200 text-xs mb-2 font-medium">总单词</Text>
                <Text className="text-white text-4xl font-bold">{stats.total_words}</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* 2. Fixed Quick Actions (Overlapping Header) */}
      <View className="px-6 -mt-10 z-10">
        <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-xl shadow-blue-900/10 flex-row justify-between items-center border border-gray-50 dark:border-gray-800">
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              className="items-center flex-1"
              onPress={() => router.push(action.route as any)}
            >
              <View className={`w-12 h-12 ${action.color} rounded-2xl items-center justify-center mb-2 shadow-sm`}>
                <FontAwesome name={action.icon as any} size={20} color="white" />
              </View>
              <Text className="text-gray-700 dark:text-gray-300 text-xs font-medium text-center" numberOfLines={1}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 3. Scrollable Content Area (Recent Wordbooks) */}
      <View className="flex-1 z-0">
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3b82f6"
            />
          }
        >
          <View className="px-6">
            {/* Recent Wordbooks */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-4 px-1">
                <Text className="text-lg font-bold text-gray-800 dark:text-white">最近单词本</Text>
                <Link href="/(tabs)/study" asChild>
                  <TouchableOpacity>
                    <Text className="text-blue-600 dark:text-blue-400 text-sm font-medium">全部</Text>
                  </TouchableOpacity>
                </Link>
              </View>

              {collections.length > 0 ? (
                <View className="space-y-3">
                  {collections.slice(0, 3).map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.9}
                      onPress={() => router.push(`/collection/${item.id}`)}
                    >
                      <View className="flex-row items-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <View
                          className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                          style={{ backgroundColor: item.color || '#3b82f6' }}
                        >
                          <Text className="text-xl">{item.icon || '📚'}</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-bold text-gray-900 dark:text-white" numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {item.word_count || 0} 词 • {item.description || '无描述'}
                          </Text>
                        </View>
                        <FontAwesome name="chevron-right" size={12} color="#d1d5db" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View className="py-8 items-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-slate-900/50">
                  <Text className="text-gray-400 mb-3 text-sm">还没有创建单词本</Text>
                  <TouchableOpacity
                    onPress={() => router.push('/collection/create')}
                    className="bg-white dark:bg-slate-800 px-5 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm"
                  >
                    <Text className="text-xs font-bold text-gray-700 dark:text-gray-200">立即创建</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
