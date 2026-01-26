import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import useAuthStore from '@/stores/useAuthStore';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert('退出登录', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '退出',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth/login');
        }
      }
    ]);
  };

  const menuGroups = [
    {
      title: '设置',
      items: [
        { icon: 'sliders', label: 'LLM 模型配置', action: () => {} },
        { icon: 'server', label: '后端地址配置', action: () => router.push('/auth/config') },
        { icon: 'bell-o', label: '提醒设置', action: () => {} },
      ]
    },
    {
      title: '关于',
      items: [
        { icon: 'info-circle', label: '关于 WordMaster', action: () => {} },
        { icon: 'github', label: 'GitHub 仓库', action: () => {} },
      ]
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
      <ScrollView contentContainerClassName="pb-10">
        {/* Profile Header */}
        <View className="bg-white dark:bg-slate-900 px-6 py-8 mb-6 border-b border-gray-200 dark:border-gray-800">
          <View className="flex-row items-center">
            <View className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full items-center justify-center mr-4">
              <Text className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {user?.nickname?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.nickname || 'User'}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 mt-1">
                {user?.email || user?.username || 'user@example.com'}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Summary */}
        <View className="px-4 mb-6">
          <Card className="flex-row justify-around py-4">
             <View className="items-center">
               <Text className="text-xl font-bold text-gray-900 dark:text-white">0</Text>
               <Text className="text-xs text-gray-500">累计天数</Text>
             </View>
             <View className="w-[1px] bg-gray-200 dark:bg-gray-700 h-full" />
             <View className="items-center">
               <Text className="text-xl font-bold text-gray-900 dark:text-white">0</Text>
               <Text className="text-xs text-gray-500">已学单词</Text>
             </View>
             <View className="w-[1px] bg-gray-200 dark:bg-gray-700 h-full" />
             <View className="items-center">
               <Text className="text-xl font-bold text-gray-900 dark:text-white">0</Text>
               <Text className="text-xs text-gray-500">掌握词汇</Text>
             </View>
          </Card>
        </View>

        {/* Menu Items */}
        <View className="px-4 space-y-6">
          {menuGroups.map((group, groupIndex) => (
            <View key={groupIndex}>
              <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 ml-2">
                {group.title}
              </Text>
              <Card className="overflow-hidden p-0">
                {group.items.map((item, index) => (
                  <View key={index}>
                    <TouchableOpacity
                      className="flex-row items-center px-4 py-4 active:bg-gray-50 dark:active:bg-slate-800"
                      onPress={item.action}
                    >
                      <View className="w-8 items-center mr-3">
                        <FontAwesome name={item.icon as any} size={20} color="#6b7280" />
                      </View>
                      <Text className="flex-1 text-base text-gray-900 dark:text-white">
                        {item.label}
                      </Text>
                      <FontAwesome name="angle-right" size={16} color="#d1d5db" />
                    </TouchableOpacity>
                    {index < group.items.length - 1 && (
                      <View className="h-[1px] bg-gray-100 dark:bg-gray-800 ml-12" />
                    )}
                  </View>
                ))}
              </Card>
            </View>
          ))}

          <Button
            variant="danger"
            className="mt-4"
            onPress={handleLogout}
            label="退出登录"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
