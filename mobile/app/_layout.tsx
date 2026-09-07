import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthSessionProvider, useAuthSession } from '@/hooks/use-auth-session';
import { RegistrationProvider } from '@/hooks/use-registration';

export const unstable_settings = {
  anchor: '(app)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthSessionProvider>
      <RegistrationProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootNavigator />
          <StatusBar style="auto" />
        </ThemeProvider>
      </RegistrationProvider>
    </AuthSessionProvider>
  );
}

function RootNavigator() {
  const { user, isLoading } = useAuthSession();
  const segments = useSegments();
  const firstSegment = segments[0];

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!user && firstSegment !== '(auth)') {
    return <Redirect href="/(auth)/login" />;
  }

  if (user && firstSegment === '(auth)') {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
