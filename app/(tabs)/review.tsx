import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Card from '@/components/common/Card';
import { useRouter } from 'expo-router';

export default function ReviewScreen() {
  const router = useRouter();

  const reviewModes = [
    {
      id: 'immediate',
      title: '即时复习',
      desc: '复习艾宾浩斯遗忘曲线到期的单词',
      icon: 'clock-o',
      color: 'bg-blue-500',
    },
    {
      id: 'random',
      title: '随机复习',
      desc: '随机抽取已学单词进行巩固',
      icon: 'random',
      color: 'bg-purple-500',
    },
    {
      id: 'book',
      title: '单词本复习',
      desc: '针对特定单词本进行全量复习',
      icon: 'book',
      color: 'bg-green-500',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
      <View className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">复习</Text>
      </View>

      <ScrollView contentContainerClassName="p-4" className="flex-1">
        <View className="space-y-4">
          {reviewModes.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              activeOpacity={0.9}
              onPress={() => {
                // Handle navigation based on mode
                // router.push(`/study/review?mode=${mode.id}`)
              }}
            >
              <Card className="flex-row items-center p-4">
                <View className={`w-12 h-12 rounded-xl ${mode.color} items-center justify-center mr-4 shadow-sm`}>
                  <FontAwesome name={mode.icon as any} size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 dark:text-white">
                    {mode.title}
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {mode.desc}
                  </Text>
                </View>
                <FontAwesome name="chevron-right" size={14} color="#d1d5db" />
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mt-8">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-2">
            复习统计
          </Text>
          <View className="flex-row space-x-3">
             <Card className="flex-1 bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-800">
               <View className="items-center py-2">
                 <Text className="text-3xl font-bold text-orange-600 dark:text-orange-400">0</Text>
                 <Text className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">待复习</Text>
               </View>
             </Card>
             <Card className="flex-1 bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800">
               <View className="items-center py-2">
                 <Text className="text-3xl font-bold text-green-600 dark:text-green-400">0</Text>
                 <Text className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">已掌握</Text>
               </View>
             </Card>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
