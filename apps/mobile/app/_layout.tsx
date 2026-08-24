import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { ThemeProvider } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';
import { ToastProvider, useToast } from '@/src/components/Toast';
import { ThemeModeProvider } from '@/src/components/DarkModeToggle';
import { I18nProvider } from '@/src/i18n';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import {
  registerForPushNotifications,
  registerPushTokenWithServer,
  addPushNotificationListener,
  addPushNotificationResponseListener,
} from '@/src/services/pushNotifications';
import {
  registerBackgroundSync,
  unregisterBackgroundSync,
} from '@/src/services/backgroundSync';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const baseFonts = {
  regular: { fontFamily: 'System', fontWeight: '400' as const },
  medium: { fontFamily: 'System', fontWeight: '500' as const },
  bold: { fontFamily: 'System', fontWeight: '700' as const },
  heavy: { fontFamily: 'System', fontWeight: '900' as const },
};

const LightTheme = {
  dark: false,
  colors: {
    primary: '#15803D',     // Field Green — exact web match
    background: '#FAFDF7',  // Sage White
    card: '#FFFFFF',
    text: '#1B2E1B',        // Forest Ink
    border: '#C8E6C9',      // Soft Branch
    notification: '#16A34A',
  },
  fonts: baseFonts,
};

const DarkThemeCustom = {
  dark: true,
  colors: {
    primary: '#4ADE80',     // Neon Leaf
    background: '#0C1A0C',  // Night Forest
    card: '#132413',         // Deep Canopy
    text: '#E8F5E9',         // Light Fern
    border: '#2E4A2E',       // Dark Branch
    notification: '#4ADE80',
  },
  fonts: baseFonts,
};

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 200,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    'FiraSans-Regular': require('../assets/fonts/FiraSans-Regular.ttf'),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    'FiraSans-Medium': require('../assets/fonts/FiraSans-Medium.ttf'),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    'FiraSans-SemiBold': require('../assets/fonts/FiraSans-SemiBold.ttf'),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    'FiraSans-Bold': require('../assets/fonts/FiraSans-Bold.ttf'),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    'FiraCode-Regular': require('../assets/fonts/FiraCode-Regular.ttf'),
  });

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

function BackgroundSyncEffect() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    registerBackgroundSync().catch((err) =>
      console.warn('[BackgroundSync] Failed to register:', err),
    );

    return () => {
      unregisterBackgroundSync().catch(() => {});
    };
  }, [isAuthenticated]);

  return null;
}

function PushNotificationsEffect() {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const removed: { remove(): void }[] = [];

    (async () => {
      const token = await registerForPushNotifications();
      if (token) {
        tokenRef.current = token;
        await registerPushTokenWithServer(token);
      }
    })();

    const sub = addPushNotificationListener((notification) => {
      const { title, body } = notification.request.content;
      showToast('info', title ?? body ?? 'New notification');
    });

    const respSub = addPushNotificationResponseListener(() => {});

    removed.push(sub, respSub);

    return () => {
      removed.forEach((s) => s.remove());
    };
  }, [isAuthenticated, showToast]);

  return null;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkThemeCustom : LightTheme;

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <I18nProvider>
            <ThemeModeProvider>
              <ThemeProvider value={theme}>
                <ToastProvider>
                  <AuthProvider>
                    <PushNotificationsEffect />
                    <BackgroundSyncEffect />
                    <RootNavigator />
                  </AuthProvider>
                </ToastProvider>
              </ThemeProvider>
            </ThemeModeProvider>
          </I18nProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
