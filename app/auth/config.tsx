import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import useConfigStore from '../../stores/useConfigStore';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';

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
      // Don't show alert, just UI feedback
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
    // Proceed to login
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
      <ScrollView contentContainerClassName="flex-grow justify-center p-6">
        <View className="max-w-md w-full mx-auto">
          <Card>
            {/* Header */}
            <View className="items-center mb-8">
              <View className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mb-4">
                <FontAwesome name="server" size={32} color="#3b82f6" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                配置后端地址
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 mt-2 text-center">
                请输入您的后端API地址
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-2">
              <Input
                label="后端地址"
                placeholder="http://192.168.1.x:8000"
                value={url}
                onChangeText={(text) => {
                  setUrl(text);
                  setTestSuccess(false); // Reset success on change
                  setError('');
                }}
                error={error}
                helperText="提示：使用真机调试时请输入电脑的局域网IP"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                prefix={<FontAwesome name="globe" size={18} color="#9ca3af" />}
              />

              <Button
                variant="primary"
                fullWidth
                loading={isTesting}
                disabled={testSuccess}
                onPress={handleTestConnection}
                className="mt-4"
              >
                {testSuccess ? (
                  <View className="flex-row items-center">
                    <FontAwesome name="check-circle" size={18} color="white" className="mr-2" />
                    <Text className="text-white font-medium ml-2">连接成功</Text>
                  </View>
                ) : (
                  '测试连接'
                )}
              </Button>

              {testSuccess && (
                <View className="mt-4">
                  <Button
                    variant="success"
                    fullWidth
                    onPress={handleSave}
                  >
                    保存并继续
                  </Button>
                </View>
              )}
            </View>

            {/* Tips */}
            <View className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Text className="text-sm text-blue-800 dark:text-blue-300">
                💡 提示：确保后端服务已启动，并且手机与电脑在同一局域网下。
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
