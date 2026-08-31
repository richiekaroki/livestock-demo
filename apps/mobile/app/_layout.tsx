import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { ThemeProvider } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import * as Sentry from 'sentry-expo';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';
import { ToastProvider } from '@/src/components/Toast';
import { ThemeModeProvider } from '@/src/components/DarkModeToggle';
import { I18nProvider } from '@/src/i18n';
import { logger } from '@/src/utils/logger';
import palette from '@/constants/Colors';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import {
  registerBackgroundSync,
  unregisterBackgroundSync,
} from '@/src/services/backgroundSync';

if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    environment: __DEV__ ? 'development' : 'production',
    enableInExpoDevelopment: false,
  });
}

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
    primary: palette.light.tint,
    background: palette.light.background,
    card: palette.light.card,
    text: palette.light.text,
    border: palette.light.border,
    notification: palette.light.success,
  },
  fonts: baseFonts,
};

const DarkThemeCustom = {
  dark: true,
  colors: {
    primary: palette.dark.tint,
    background: palette.dark.background,
    card: palette.dark.card,
    text: palette.dark.text,
    border: palette.dark.border,
    notification: palette.dark.success,
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
        animation: 'slide_from_right',
        animationDuration: 300,
        contentStyle: { backgroundColor: 'transparent' },
        gestureEnabled: true,
        gestureDirection: 'horizontal',
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
      logger.warn('[BackgroundSync] Failed to register:', err),
    );

    return () => {
      unregisterBackgroundSync().catch(() => {});
    };
  }, [isAuthenticated]);

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
