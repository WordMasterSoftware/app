import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import useAuthStore from '@/stores/useAuthStore';
import CustomAlert, { AlertButton } from '@/components/common/CustomAlert';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message?: string;
    buttons?: AlertButton[];
  }>({ title: '' });

  const showAlert = (title: string, message?: string, buttons?: AlertButton[]) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  const handleLogout = async () => {
    showAlert('退出登录', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel', onPress: () => setAlertVisible(false) },
      {
        text: '退出',
        style: 'destructive',
        onPress: async () => {
          setAlertVisible(false);
          await logout();
          router.replace('/auth/login');
        }
      }
    ]);
  };

  const handleOpenGithub = () => {
    Linking.openURL('https://github.com/WordMasterSoftware/WordMaster');
  };

  const menuGroups = [
    {
      title: '设置',
      items: [
        {
          icon: 'sliders',
          label: 'LLM 模型配置',
          action: () => showAlert('提示', '功能开发中', [{ text: '好的', onPress: () => setAlertVisible(false) }])
        },
        {
          icon: 'server',
          label: '后端地址配置',
          action: () => router.push('/auth/config')
        },
        {
          icon: 'bell-o',
          label: '提醒设置',
          action: () => showAlert('提示', '功能开发中', [{ text: '好的', onPress: () => setAlertVisible(false) }])
        },
      ]
    },
    {
      title: '关于',
      items: [
        {
          icon: 'github',
          label: 'GitHub 仓库',
          action: handleOpenGithub
        },
        {
          icon: 'info-circle',
          label: '关于 WordMaster',
          action: () => showAlert('关于', 'WordMaster v1.2.0\n\n一款由 AI 驱动的跨平台开源新型背单词应用。', [{ text: '关闭', onPress: () => setAlertVisible(false) }])
        },
      ]
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-blue-600 dark:bg-blue-600" edges={['top']}>
      <StatusBar style="light" backgroundColor="#2563eb" />
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
      />

      {/* Header Section */}
      <View className="bg-blue-600 rounded-b-[40px] pb-8 shadow-xl">
        <View className="items-center px-6 pt-2">
            {/* Avatar Container */}
            <View className="w-24 h-24 bg-white/20 rounded-full p-1 mb-3 border-2 border-white/30 backdrop-blur-md">
              <View className="flex-1 bg-white dark:bg-slate-800 rounded-full items-center justify-center overflow-hidden">
                {user?.avatar_url ? (
                  <Text className="text-4xl">👤</Text>
                ) : (
                  <Text className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {user?.nickname?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                )}
              </View>
            </View>

            {/* User Info */}
            <Text className="text-2xl font-bold text-white mb-2 shadow-sm tracking-wide">
              {user?.nickname || 'User'}
            </Text>
            <View className="bg-blue-700/40 px-4 py-1.5 rounded-full border border-blue-400/20">
              <Text className="text-blue-50 font-medium text-xs">
                {user?.email || user?.username || 'user@example.com'}
              </Text>
            </View>
          </View>
      </View>

      {/* Scrollable Content Container */}
      <View className="flex-1 mt-4 bg-white dark:bg-slate-900 rounded-t-[32px] overflow-hidden shadow-sm border-t border-gray-100 dark:border-gray-800">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 4, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          decelerationRate="normal"
          bounces={true}
          alwaysBounceVertical={true}
          removeClippedSubviews={Platform.OS === 'android'}
        >
          {/* Menu Groups */}
          <View className="space-y-8">
            {menuGroups.map((group, groupIndex) => (
              <View key={groupIndex}>
                <Text className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-6 mb-4 ml-4 uppercase tracking-widest">
                  {group.title}
                </Text>
                <View className="bg-gray-50 dark:bg-slate-800/50 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800">
                  {group.items.map((item, index) => (
                    <View key={index}>
                      <TouchableOpacity
                        className="flex-row items-center px-5 py-4 active:bg-gray-100 dark:active:bg-slate-800"
                        onPress={item.type === 'switch' ? item.action : item.action}
                        disabled={item.type === 'switch'} // Let Switch handle the interaction or handle it via Row press if preferred.
                        // Better to let Row press trigger toggle for larger tap area
                      >
                        <View className={`w-10 h-10 rounded-2xl items-center justify-center mr-4 ${index % 2 === 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-indigo-100 dark:bg-indigo-900/30'}`}>
                          <FontAwesome name={item.icon as any} size={18} color="#3b82f6" />
                        </View>
                        <Text className="flex-1 text-base font-semibold text-gray-800 dark:text-gray-100">
                          {item.label}
                        </Text>

                        {item.type === 'switch' ? (
                          <Switch
                            value={item.value}
                            onValueChange={item.action}
                            trackColor={{ false: '#767577', true: '#3b82f6' }}
                            thumbColor={item.value ? '#ffffff' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                          />
                        ) : (
                          <FontAwesome name="chevron-right" size={12} color="#d1d5db" />
                        )}
                      </TouchableOpacity>
                      {index < group.items.length - 1 && (
                        <View className="h-[1px] bg-gray-200/50 dark:bg-gray-700/50 ml-20" />
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ))}

            <TouchableOpacity
              onPress={handleLogout}
              className="mt-6 bg-red-50 dark:bg-red-900/10 py-4 rounded-3xl border border-red-100 dark:border-red-900/30 items-center justify-center active:bg-red-100"
            >
              <Text className="text-red-600 font-bold text-base">退出登录</Text>
            </TouchableOpacity>

            <View className="items-center mt-8">
              <Text className="text-xs text-gray-300 dark:text-gray-600">WordMaster v1.2.0</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
