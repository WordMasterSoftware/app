import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import useConfigStore from '../../stores/useConfigStore';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function ConfigScreen() {
  const router = useRouter();
  const { baseURL, setBaseURL, testConnection } = useConfigStore();
  const [url, setUrl] = useState(baseURL || 'http://localhost:8000');
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleTestConnection = async () => {
    if (!url) {
      setError('请输入后端地址');
      return;
    }

    if (url.endsWith('/')) {
      setError('URL不应以斜杠结尾');
      return;
    }

    setIsTesting(true);
    setTestSuccess(false);
    setError('');

    try {
      await testConnection(url);
      setTestSuccess(true);
    } catch (err: any) {
      setTestSuccess(false);
      setError(err.message || '连接失败，请检查后端地址');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    if (!testSuccess) {
      setError('请先测试连接');
      return;
    }

    setBaseURL(url);
    router.replace('/auth/login');
  };

  return (
    <View className="flex-1 bg-white dark:bg-slate-950">
      {/* 1. Top Blue Background (45% Height) */}
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
            {/* Header Content (On Blue Background) */}
            <View className="items-center mb-8 mt-20">
              <View className="w-20 h-20 bg-white/20 rounded-2xl items-center justify-center mb-4 border border-white/10">
                <FontAwesome name="server" size={36} color="white" />
              </View>
              <Text className="text-3xl font-bold text-white mb-2">
                连接服务器
              </Text>
              <Text className="text-blue-100 text-center text-base px-8 opacity-90">
                配置后端 API 地址以开始使用
              </Text>
            </View>

            {/* Overlapping Card (White) */}
            <View className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl shadow-blue-900/10 mb-6">
              <Input
                label="服务器地址"
                placeholder="http://192.168.1.x:8000"
                value={url}
                onChangeText={(text) => {
                  setUrl(text);
                  setTestSuccess(false);
                  setError('');
                }}
                error={error}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                prefix={<FontAwesome name="globe" size={18} color="#9ca3af" />}
                containerClassName="mb-6"
              />
              <Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">例如：https://api.example.com</Text>
              <Button
                variant={testSuccess ? 'success' : 'primary'}
                fullWidth
                size="lg"
                loading={isTesting}
                onPress={testSuccess ? handleSave : handleTestConnection}
                className="shadow-md shadow-blue-500/30"
              >
                {testSuccess ? (
                  <View className="flex-row items-center">
                    <Text className="text-white font-bold text-base mr-2">进入应用</Text>
                    <FontAwesome name="arrow-right" size={16} color="white" />
                  </View>
                ) : (
                  '测试连接'
                )}
              </Button>

              {testSuccess && (
                <View className="flex-row items-center justify-center mt-4 bg-green-50 dark:bg-green-900/20 py-2 rounded-lg">
                  <FontAwesome name="check-circle" size={14} color="#10b981" />
                  <Text className="text-green-600 dark:text-green-400 ml-2 text-sm font-medium">连接成功</Text>
                </View>
              )}
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
