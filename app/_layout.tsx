import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';
import useAuthStore from '../stores/useAuthStore';
import useConfigStore from '../stores/useConfigStore';

import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { loadToken, isAuthenticated } = useAuthStore();
  const { isConfigured } = useConfigStore();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // Initialization Effect
  useEffect(() => {
    const initApp = async () => {
      try {
        await loadToken();
      } catch (e) {
        console.error('Failed to load token', e);
      } finally {
        setIsReady(true);
      }
    };
    initApp();
  }, []);

  // Auth Guard Effect
  useEffect(() => {
    if (!isReady) return;

    // Check if segments are available
    if (!segments) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!isConfigured) {
      if (segments[1] !== 'config') {
        router.replace('/auth/config');
      }
    } else if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace('/auth/login');
      } else if (segments[1] !== 'login' && segments[1] !== 'register' && segments[1] !== 'config') {
        router.replace('/auth/login');
      }
    } else {
      if (inAuthGroup && segments[1] !== 'config') {
         router.replace('/(tabs)');
      }
    }
  }, [isReady, isConfigured, isAuthenticated, segments]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
