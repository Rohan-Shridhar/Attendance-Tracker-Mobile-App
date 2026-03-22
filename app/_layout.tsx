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
  
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const currentSegment = segments[0] as string | undefined;
    const inTeacherGroup = currentSegment === '(teacher)';
    const inStudentGroup = currentSegment === '(student)';

    if (!isLoggedIn) {
      if (currentSegment !== 'login') {
        router.replace('/login' as any);
      }
    } else if (isLoggedIn) {
      if (user?.role === 'teacher' && !inTeacherGroup) {
        router.replace('/(teacher)/profile' as any);
      } else if (user?.role === 'student' && !inStudentGroup) {
        router.replace('/(student)/profile' as any);
      }
    }
  }, [isLoggedIn, segments, user, router, isReady]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 48, fontWeight: 'bold', color: colors.primary, letterSpacing: -1 }}>AttendX</Text>
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
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
