import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../store/themeStore';

export default function LandingScreen() {
  const router = useRouter();
  const { colors, isDarkMode, toggleTheme } = useThemeStore();

  const handleNavigateToLogin = (role: 'student' | 'teacher') => {
    if (role === 'student') {
      router.replace('/student-login');
    } else {
      router.replace('/teacher-login');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Theme Toggle */}
      <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
        <Ionicons name={isDarkMode ? 'sunny-outline' : 'moon-outline'} size={28} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.topSection}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '11' }]}>
          <Ionicons name="shield-checkmark-outline" size={100} color={colors.primary} />
        </View>
        <Text style={[styles.appName, { color: colors.primary }]}>Attendance Tracker</Text>
        <Text style={[styles.tagline, { color: colors.subtext }]}>Simple. Strict. Reliable.</Text>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity 
          style={[styles.filledButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
          onPress={() => handleNavigateToLogin('student')}
        >
          <Ionicons name="person-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.filledButtonText}>Login as Student</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.outlinedButton, { borderColor: colors.primary }]}
          onPress={() => handleNavigateToLogin('teacher')}
        >
          <Ionicons name="school-outline" size={20} color={colors.primary} style={styles.buttonIcon} />
          <Text style={[styles.outlinedButtonText, { color: colors.primary }]}>Login as Teacher</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: colors.subtext }]}>v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  themeToggle: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  topSection: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  bottomSection: {
    flex: 0.4,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  filledButton: {
    flexDirection: 'row',
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  filledButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  outlinedButton: {
    flexDirection: 'row',
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 25,
  },
  outlinedButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 12,
  },
  versionText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});
