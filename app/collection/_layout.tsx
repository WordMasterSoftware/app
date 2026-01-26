import { Stack } from 'expo-router';

export default function CollectionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="create" options={{ presentation: 'modal', title: '创建单词本' }} />
      <Stack.Screen name="import" options={{ presentation: 'modal', title: '导入单词' }} />
      <Stack.Screen name="[id]" options={{ title: '单词本详情' }} />
    </Stack>
  );
}
