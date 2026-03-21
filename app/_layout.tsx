import { useEffect, useState } from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useAuthStore } from '../store/authStore';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isLoggedIn, user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1.5 second splash screen delay before checking auth state
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    // Determine if the user is in the auth group or logged-in group
    const currentSegment = segments[0] as string | undefined;
    const inTeacherGroup = currentSegment === '(teacher)';
    const inStudentGroup = currentSegment === '(student)';
    const inTabsGroup = inTeacherGroup || inStudentGroup;

    if (!isLoggedIn) {
      // If not logged in, redirect to login if they are anywhere else (like index)
      if (currentSegment !== 'login') {
        router.replace('/login' as any);
      }
    } else if (isLoggedIn) {
      // If logged in, ensure they are in their correct group
      if (user?.role === 'teacher' && !inTeacherGroup) {
        router.replace('/(teacher)/profile' as any);
      } else if (user?.role === 'student' && !inStudentGroup) {
        router.replace('/(student)/profile' as any);
      }
    }
  }, [isLoggedIn, segments, user, router, isReady]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1F3864', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: -1 }}>AttendX</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(teacher)" />
        <Stack.Screen name="(student)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
