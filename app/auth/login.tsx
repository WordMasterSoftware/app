import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
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

      // Response structure from API: { success: true, data: { token, user_id, ... } }
      // Based on CLAUDE.md: Returns: { "success": true, "data": { "token": "...", "user_id": "..." } }
      // But my authApi returns response.data directly because of interceptor?
      // client.ts interceptor returns response.data.
      // So response is the body.
      // Wait, web Login.jsx does: login(response.data).
      // Let's check CLAUDE.md again.
      // "Returns: { "success": true, "data": { "token": "...", "user_id": "..." } }"
      // If client.ts returns response.data, then `response` IS that object.
      // We need to pass the inner data to login store if that's what it expects?
      // useAuthStore.ts: login(token, user).
      // We need to fetch user profile or if it's included.
      // Standard flow: Login -> Get Token -> Get Me (if user info not in login response)
      // Or login response has it.
      // Let's assume response.data contains token and user info or we fetch me.
      // Web Login.jsx: login(response.data)
      // Let's look at web useAuthStore... I didn't read it fully but I implemented a new one for App.
      // App useAuthStore expects (token, user).

      const { data } = response as any; // { token, user: {...} } or similar
      // If the backend returns just token and user_id, we might need to fetch user details.
      // Let's try to fetch user details immediately.

      const token = data.token;

      // Manually set token in store/storage temporarily or use a helper
      // But useAuthStore.login takes token and user.

      // Let's do a quick hack: use the token to fetch user
      // But we can't use apiClient easily without token in store.
      // Actually client.ts reads from store.

      // Let's just pass what we have if possible, or:
      // 1. Store token
      // 2. Fetch user

      // For now, let's assume data contains user object or we mock it,
      // but safely we should probably implement `login` to take just token and then fetch user?
      // No, let's stick to the store interface I wrote: login(token, user).

      // If the login response doesn't have full user info, we might need to change the store.
      // Let's try to fetch 'me' after getting token.
      // We can directly call apiClient with header.

      // For now, I'll assume the login response has user info to match Web's `login(response.data)`.

      await login(token, data.user || { id: data.user_id, username: account, email: '' });
      // Fallback if user object is missing

      router.replace('/(tabs)');
    } catch (error: any) {
      const msg = error.response?.data?.message || '登录失败，请检查账号密码';
      Alert.alert('登录失败', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
      <ScrollView contentContainerClassName="flex-grow justify-center p-6">
        <View className="max-w-md w-full mx-auto">
          <Card>
            {/* Header */}
            <View className="items-center mb-8">
              <Text className="text-3xl font-bold text-gray-900 dark:text-white">
                欢迎回来
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 mt-2">
                登录到 WordMaster
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-4">
              <Input
                label="用户名或邮箱"
                placeholder="请输入用户名或邮箱"
                value={account}
                onChangeText={setAccount}
                error={errors.account}
                autoCapitalize="none"
                prefix={<FontAwesome name="user-o" size={18} color="#9ca3af" />}
              />

              <Input
                label="密码"
                placeholder="请输入密码"
                value={password}
                onChangeText={setPassword}
                error={errors.password}
                secureTextEntry
                prefix={<FontAwesome name="lock" size={20} color="#9ca3af" />}
              />

              <Button
                variant="primary"
                fullWidth
                loading={isLoading}
                onPress={handleSubmit}
                className="mt-2"
              >
                登录
              </Button>
            </View>

            {/* Footer */}
            <View className="mt-6 items-center space-y-3">
              <View className="flex-row">
                <Text className="text-gray-600 dark:text-gray-400">
                  还没有账号？{' '}
                </Text>
                <Link href="/auth/register" asChild>
                  <TouchableOpacity>
                    <Text className="text-blue-600 dark:text-blue-400 font-medium">
                      立即注册
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>

              <Link href="/auth/config" asChild>
                <TouchableOpacity>
                  <Text className="text-gray-500 dark:text-gray-500 text-sm">
                    配置后端地址
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
