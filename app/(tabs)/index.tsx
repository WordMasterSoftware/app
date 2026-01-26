import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, useRouter } from 'expo-router';
import GlassView from '@/components/common/GlassView';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import useAuthStore from '@/stores/useAuthStore';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const router = useRouter();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Mock refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-slate-950">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section with Glass Effect */}
        <View className="relative h-48 bg-blue-600 dark:bg-blue-800">
          <View className="absolute bottom-0 left-0 right-0 h-6 bg-gray-50 dark:bg-slate-950 rounded-t-3xl z-10" />
          <SafeAreaView className="px-6 pt-4">
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-blue-100 text-sm font-medium">欢迎回来 👋</Text>
                <Text className="text-white text-2xl font-bold mt-1">
                  {user?.nickname || user?.username || 'Learner'}
                </Text>
              </View>
              <Link href="/(tabs)/profile" asChild>
                <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center border border-white/30">
                  <FontAwesome name="user" size={20} color="white" />
                </View>
              </Link>
            </View>

            {/* Stats Overview */}
            <View className="flex-row space-x-4">
               <View className="flex-1">
                  <Text className="text-blue-100 text-xs">今日学习</Text>
                  <Text className="text-white text-2xl font-bold">0</Text>
               </View>
               <View className="flex-1">
                  <Text className="text-blue-100 text-xs">待复习</Text>
                  <Text className="text-white text-2xl font-bold">0</Text>
               </View>
               <View className="flex-1">
                  <Text className="text-blue-100 text-xs">总单词</Text>
                  <Text className="text-white text-2xl font-bold">0</Text>
               </View>
            </View>
          </SafeAreaView>
        </View>

        {/* Content */}
        <View className="px-4 -mt-2">
           {/* Quick Actions */}
           <View className="flex-row space-x-3 mb-6">
             <View className="flex-1">
               <Card
                 className="bg-blue-500 border-blue-400"
                 onPress={() => router.push('/(tabs)/study')}
               >
                 <View className="items-center py-2">
                   <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mb-2">
                     <FontAwesome name="book" size={20} color="white" />
                   </View>
                   <Text className="text-white font-bold text-lg">开始学习</Text>
                   <Text className="text-blue-100 text-xs mt-1">继续上次进度</Text>
                 </View>
               </Card>
             </View>
             <View className="flex-1">
               <Card
                 className="bg-purple-500 border-purple-400"
                 onPress={() => router.push('/(tabs)/review')}
               >
                 <View className="items-center py-2">
                   <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mb-2">
                     <FontAwesome name="refresh" size={20} color="white" />
                   </View>
                   <Text className="text-white font-bold text-lg">复习巩固</Text>
                   <Text className="text-purple-100 text-xs mt-1">0 个单词待复习</Text>
                 </View>
               </Card>
             </View>
           </View>

           {/* Marketplace / Wordbooks Preview */}
           <View className="mb-4">
             <View className="flex-row justify-between items-center mb-3">
               <Text className="text-lg font-bold text-gray-800 dark:text-white">单词本</Text>
               <Link href="/(tabs)/study" asChild>
                 <Text className="text-blue-600 dark:text-blue-400 text-sm">全部</Text>
               </Link>
             </View>

             {/* Empty State / Placeholder */}
             <Card>
               <View className="items-center py-6">
                 <FontAwesome name="folder-open-o" size={40} color="#9ca3af" />
                 <Text className="text-gray-500 dark:text-gray-400 mt-3 text-center">
                   还没有添加单词本
                 </Text>
                 <Button
                   size="sm"
                   variant="outline"
                   className="mt-4"
                   onPress={() => router.push('/(tabs)/study')}
                 >
                   去添加
                 </Button>
               </View>
             </Card>
           </View>

           {/* Chart Placeholder */}
           <View className="mb-6">
             <Text className="text-lg font-bold text-gray-800 dark:text-white mb-3">学习统计</Text>
             <Card>
               <View className="h-40 items-center justify-center">
                  <Text className="text-gray-400 italic">统计图表区域</Text>
               </View>
             </Card>
           </View>
        </View>
      </ScrollView>
    </View>
  );
}
