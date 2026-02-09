import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ReviewScreen() {
  const router = useRouter();

  const reviewModes = [
    {
      id: 'immediate',
      title: '即时复习',
      desc: '复习艾宾浩斯遗忘曲线到期的单词',
      icon: 'clock-o',
      gradient: ['#3B82F6', '#1D4ED8'] as const,
      shadowColor: '#3B82F6',
    },
    {
      id: 'random',
      title: '随机复习',
      desc: '随机抽取已学单词进行巩固',
      icon: 'random',
      gradient: ['#8B5CF6', '#6D28D9'] as const,
      shadowColor: '#8B5CF6',
    },
    {
      id: 'book',
      title: '单词本复习',
      desc: '针对特定单词本进行全量复习',
      icon: 'book',
      gradient: ['#10B981', '#059669'] as const,
      shadowColor: '#10B981',
    },
  ];

  const stats = [
    { label: '待复习', value: 0, color: '#F97316', bgLight: '#FFF7ED', bgDark: 'rgba(249,115,22,0.1)' },
    { label: '已掌握', value: 0, color: '#10B981', bgLight: '#ECFDF5', bgDark: 'rgba(16,185,129,0.1)' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950" edges={['top']}>
      <StatusBar style="auto" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate="normal"
        bounces={true}
        alwaysBounceVertical={true}
        removeClippedSubviews={Platform.OS === 'android'}
      >
        {/* Header Section */}
        <View className="px-6 pt-6 pb-8">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white">
            复习中心
          </Text>
          <Text className="text-base text-gray-500 dark:text-gray-400 mt-2">
            选择复习模式，巩固记忆
          </Text>
        </View>

        {/* Stats Cards */}
        <View className="px-6 mb-8">
          <View className="flex-row gap-4">
            {stats.map((stat, index) => (
              <View
                key={index}
                className="flex-1 rounded-2xl p-5 border border-gray-100 dark:border-gray-800"
                style={{ backgroundColor: stat.bgLight }}
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text
                      className="text-4xl font-bold"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </Text>
                    <Text
                      className="text-sm mt-1 opacity-80"
                      style={{ color: stat.color }}
                    >
                      {stat.label}
                    </Text>
                  </View>
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <FontAwesome
                      name={index === 0 ? 'refresh' : 'check-circle'}
                      size={22}
                      color={stat.color}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Review Modes Section */}
        <View className="px-6 pb-4">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            复习模式
          </Text>

          <View className="gap-4">
            {reviewModes.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                activeOpacity={0.85}
                onPress={() => {
                  // router.push(`/study/review?mode=${mode.id}`)
                }}
                style={{
                  shadowColor: mode.shadowColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <LinearGradient
                  colors={mode.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-2xl overflow-hidden"
                >
                  <View className="p-5 flex-row items-center">
                    {/* Icon Container */}
                    <View className="w-14 h-14 rounded-xl bg-white/20 items-center justify-center mr-4">
                      <FontAwesome name={mode.icon as any} size={26} color="white" />
                    </View>

                    {/* Text Content */}
                    <View className="flex-1">
                      <Text className="text-xl font-bold text-white">
                        {mode.title}
                      </Text>
                      <Text className="text-sm text-white/80 mt-1">
                        {mode.desc}
                      </Text>
                    </View>

                    {/* Arrow */}
                    <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center">
                      <FontAwesome name="arrow-right" size={14} color="white" />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tips Section */}
        <View className="px-6 mt-8">
          <View className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 border border-blue-100 dark:border-blue-800/50">
            <View className="flex-row items-center mb-3">
              <FontAwesome name="lightbulb-o" size={18} color="#3B82F6" />
              <Text className="text-base font-semibold text-blue-600 dark:text-blue-400 ml-2">
                复习小贴士
              </Text>
            </View>
            <Text className="text-sm text-blue-600/80 dark:text-blue-400/80 leading-5">
              根据艾宾浩斯遗忘曲线，及时复习可以显著提高记忆效率。建议每天定时进行即时复习，保持学习节奏。
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
