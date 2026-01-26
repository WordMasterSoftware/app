import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import useAuthStore from '../../stores/useAuthStore';
import { authApi } from '../../api/auth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ account?: string; password?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!account) newErrors.account = '请输入用户名或邮箱';
    if (!password) newErrors.password = '请输入密码';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await authApi.login({ account, password });
      const { data } = response as any;
      await login(data.token, data.user || { id: data.user_id, username: account, email: '' });
      router.replace('/(tabs)');
    } catch (error: any) {
      const msg = error.response?.data?.message || '登录失败，请检查账号密码';
      // In a real app we might use toast, here we rely on error state or alert
      // Alert.alert('登录失败', msg); // Removed alert for cleaner UX, can use error text
      setErrors({ ...errors, password: msg }); // Simple feedback
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-slate-950">
      {/* 1. Top Blue Background */}
      <View className="absolute top-0 left-0 right-0 h-[45%] bg-blue-600" />

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerClassName="flex-grow justify-center px-6"
            keyboardShouldPersistTaps="handled"
          >
            {/* Header Content */}
            <View className="items-center mb-8 mt-20">
              <Text className="text-3xl font-bold text-white mb-2 tracking-wide">
                欢迎回来
              </Text>
              <Text className="text-blue-100 text-center text-base px-8 opacity-90">
                登录 WordMaster 继续学习
              </Text>
            </View>

            {/* Overlapping Card */}
            <View className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl shadow-blue-900/10 mb-6">
              <Input
                label="用户名或邮箱"
                placeholder="请输入用户名或邮箱"
                value={account}
                onChangeText={setAccount}
                error={errors.account}
                autoCapitalize="none"
                prefix={<FontAwesome name="user-o" size={18} color="#9ca3af" />}
                containerClassName="mb-4"
              />

              <Input
                label="密码"
                placeholder="请输入密码"
                value={password}
                onChangeText={setPassword}
                error={errors.password}
                secureTextEntry
                prefix={<FontAwesome name="lock" size={20} color="#9ca3af" />}
                containerClassName="mb-6"
              />

              <Button
                variant="primary"
                fullWidth
                size="lg"
                loading={isLoading}
                onPress={handleSubmit}
                className="shadow-md shadow-blue-500/30"
              >
                登录
              </Button>

              <View className="flex-row justify-center mt-6 space-x-1">
                <Text className="text-gray-500">还没有账号？</Text>
                <Link href="/auth/register" asChild>
                  <TouchableOpacity>
                    <Text className="text-blue-600 font-bold">立即注册</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>

            {/* Bottom Config Link */}
            <View className="flex-row justify-center mt-4">
              <Link href="/auth/config" asChild>
                <TouchableOpacity className="flex-row items-center bg-gray-50 dark:bg-slate-800 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-700">
                  <FontAwesome name="cog" size={14} color="#6b7280" className="mr-2" />
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    配置后端地址
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
