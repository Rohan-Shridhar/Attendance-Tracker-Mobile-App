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
  ActivityIndicator,
  LayoutAnimation
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore, Role } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { studentLogin, teacherLogin } from '../src/services/api';

export default function LoginScreen() {
  const [role, setRole] = useState<Role>('student');
  const [usn, setUsn] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setAuth = useAuthStore((state) => state.setAuth);
  const { colors, isDarkMode, toggleTheme } = useThemeStore();
  const router = useRouter();

  const handleRoleChange = (newRole: Role) => {
    if (newRole !== role) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setRole(newRole);
      setErrorMessage(null);
    }
  };

  const handleLogin = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      let userData;
      if (role === 'student') {
        if (!usn || !password) {
          throw new Error('Please enter both USN and Password');
        }
        userData = await studentLogin(usn, password);
      } else {
        if (!email) {
          throw new Error('Please enter your Email');
        }
        userData = await teacherLogin(email);
      }

      // Success
      setAuth(userData);
      
      // Navigate to correct tab based on role
      if (role === 'student') {
        router.replace('/(student)');
      } else {
        router.replace('/(teacher)');
      }
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
          <Text style={[styles.logo, { color: colors.primary }]}>Attendance Tracker</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>Sign in to continue</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Role Selector */}
          <View style={styles.roleContainer}>
            <TouchableOpacity 
              style={[
                styles.roleButton, 
                role === 'student' ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: 'transparent', borderColor: colors.border }
              ]}
              onPress={() => handleRoleChange('student')}
            >
              <Text style={[styles.roleButtonText, { color: role === 'student' ? '#FFFFFF' : colors.text }]}>Student</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.roleButton, 
                role === 'teacher' ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: 'transparent', borderColor: colors.border }
              ]}
              onPress={() => handleRoleChange('teacher')}
            >
              <Text style={[styles.roleButtonText, { color: role === 'teacher' ? '#FFFFFF' : colors.text }]}>Teacher</Text>
            </TouchableOpacity>
          </View>

          {role === 'student' ? (
            <>
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
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color={colors.subtext} />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                <MaterialIcons name="email" size={20} color={colors.subtext} style={styles.icon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="name.cse@bmsce.ac.in"
                  placeholderTextColor={colors.subtext}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrorMessage(null);
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          {errorMessage && (
            <Text style={[styles.errorText, { color: colors.badgeRed }]}>
              {errorMessage}
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  themeToggle: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: -1,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 25,
    gap: 15,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 5,
  },
  button: {
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
});
