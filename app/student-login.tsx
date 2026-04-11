import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { studentLogin } from '../src/services/api';

export default function StudentLoginScreen() {
  const [usn, setUsn] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setAuth = useAuthStore((state) => state.setAuth);
  const { colors, isDarkMode, toggleTheme } = useThemeStore();
  const router = useRouter();

  const handleLogin = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (!usn || !password) {
        throw new Error('Please enter both USN and Password');
      }
      const userData = await studentLogin(usn, password);
      setAuth(userData);
      router.replace('/(student)' as any);
    } catch (error: any) {
      setErrorMessage(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <TouchableOpacity onPress={() => router.replace('/landing')} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color={colors.text} />
      </TouchableOpacity>
      
      <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
        <Ionicons name={isDarkMode ? 'sunny-outline' : 'moon-outline'} size={28} color={colors.text} />
      </TouchableOpacity>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.headerContainer}>
          <Text style={[styles.logo, { color: colors.primary }]}>Student Login</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>Sign in with your USN</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>USN</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <MaterialIcons name="person" size={20} color={colors.subtext} style={styles.icon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter USN (e.g. 1WN24CS001)"
                placeholderTextColor={colors.subtext}
                value={usn}
                onChangeText={(text) => {
                  setUsn(text);
                  setErrorMessage(null);
                }}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <MaterialIcons name="lock" size={20} color={colors.subtext} style={styles.icon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter numeric password"
                placeholderTextColor={colors.subtext}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrorMessage(null);
                }}
                secureTextEntry={!showPassword}
                keyboardType="numeric"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color={colors.subtext} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Login</Text>}
          </TouchableOpacity>

          {errorMessage && <Text style={[styles.errorText, { color: colors.badgeRed }]}>{errorMessage}</Text>}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  themeToggle: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, right: 20, zIndex: 10, padding: 10 },
  backButton: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 20, zIndex: 10, padding: 10 },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  headerContainer: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, fontWeight: '500' },
  formContainer: { width: '100%' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, marginBottom: 8, fontWeight: '600' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 15, height: 55 },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16 },
  eyeIcon: { padding: 5 },
  button: { borderRadius: 12, height: 55, justifyContent: 'center', alignItems: 'center', marginTop: 15, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  errorText: { marginTop: 20, textAlign: 'center', fontSize: 14, fontWeight: '600' },
});
