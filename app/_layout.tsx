import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

export default function RootLayout() {
  const { isLoggedIn, user } = useAuthStore();
  const { isDarkMode, colors, toggleTheme } = useThemeStore();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  
  useEffect(() => {
    // Set navigation as ready after the first layout render
    setIsNavigationReady(true);
  }, []);
  
  useEffect(() => {
    if (!isNavigationReady) return;

    const currentSegment = segments[0] as string | undefined;
    const inTeacherGroup = currentSegment === '(teacher)';
    const inStudentGroup = currentSegment === '(student)';

    if (!isLoggedIn) {
      if (currentSegment !== 'landing' && currentSegment !== 'login') {
        router.replace('/landing' as any);
      }
    } else if (isLoggedIn) {
      if (user?.role === 'teacher' && !inTeacherGroup) {
        router.replace('/(teacher)/profile' as any);
      } else if (user?.role === 'student' && !inStudentGroup) {
        router.replace('/(student)/profile' as any);
      }
    }
  }, [isLoggedIn, segments, user, router, isNavigationReady]);



  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="landing" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(teacher)" />
        <Stack.Screen name="(student)" />
        <Stack.Screen name="modal" options={{ 
          presentation: 'modal', 
          title: 'Modal', 
          headerStyle: { backgroundColor: colors.primary }, 
          headerTintColor: '#FFF',
          headerRight: () => (
            <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 15 }}>
              <Ionicons name={isDarkMode ? 'sunny-outline' : 'moon-outline'} size={24} color="#FFF" />
            </TouchableOpacity>
          )
        }} />
      </Stack>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
    </>
  );
}
