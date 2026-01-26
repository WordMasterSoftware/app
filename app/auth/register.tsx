import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import useAuthStore from '../../stores/useAuthStore';
import { authApi } from '../../api/auth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username) newErrors.username = '请输入用户名';
    else if (formData.username.length < 3) newErrors.username = '用户名至少3个字符';

    if (!formData.email) newErrors.email = '请输入邮箱';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = '请输入有效的邮箱地址';

    if (!formData.password) newErrors.password = '请输入密码';
    else if (formData.password.length < 6) newErrors.password = '密码至少6个字符';

    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = '两次密码输入不一致';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await authApi.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname || formData.username,
      });

      const { data } = response as any;
      await login(data.token, data.user || { id: data.user_id, username: formData.username, email: formData.email });
      router.replace('/(tabs)');
    } catch (error: any) {
      const msg = error.response?.data?.message || '注册失败，请检查输入信息';
      // Use general error or field specific if known, for now just reuse password field for general error
      setErrors({ ...errors, password: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
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
            <View className="items-center mb-8 mt-10">
              <Text className="text-3xl font-bold text-white mb-2 tracking-wide">
                创建账号
              </Text>
              <Text className="text-blue-100 text-center text-base px-8 opacity-90">
                加入 WordMaster 开始积累词汇
              </Text>
            </View>

            {/* Overlapping Card */}
            <View className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl shadow-blue-900/10 mb-6">
              <Input
                label="用户名"
                placeholder="3-50个字符"
                value={formData.username}
                onChangeText={(v) => handleChange('username', v)}
                error={errors.username}
                autoCapitalize="none"
                prefix={<FontAwesome name="user" size={18} color="#9ca3af" />}
                containerClassName="mb-3"
              />

              <Input
                label="邮箱"
                placeholder="your@email.com"
                value={formData.email}
                onChangeText={(v) => handleChange('email', v)}
                error={errors.email}
                autoCapitalize="none"
                keyboardType="email-address"
                prefix={<FontAwesome name="envelope" size={16} color="#9ca3af" />}
                containerClassName="mb-3"
              />

              <Input
                label="密码"
                placeholder="6-20个字符"
                value={formData.password}
                onChangeText={(v) => handleChange('password', v)}
                error={errors.password}
                secureTextEntry
                prefix={<FontAwesome name="lock" size={20} color="#9ca3af" />}
                containerClassName="mb-3"
              />

              <Input
                label="确认密码"
                placeholder="再次输入密码"
                value={formData.confirmPassword}
                onChangeText={(v) => handleChange('confirmPassword', v)}
                error={errors.confirmPassword}
                secureTextEntry
                prefix={<FontAwesome name="lock" size={20} color="#9ca3af" />}
                containerClassName="mb-3"
              />

              <Input
                label="昵称（可选）"
                placeholder="显示名称"
                value={formData.nickname}
                onChangeText={(v) => handleChange('nickname', v)}
                prefix={<FontAwesome name="id-badge" size={18} color="#9ca3af" />}
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
                注册
              </Button>

              <View className="flex-row justify-center mt-6 space-x-1">
                <Text className="text-gray-500">已有账号？</Text>
                <Link href="/auth/login" asChild>
                  <TouchableOpacity>
                    <Text className="text-blue-600 font-bold">立即登录</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
