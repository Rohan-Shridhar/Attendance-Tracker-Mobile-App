import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView, ScrollView, TouchableWithoutFeedback, Alert, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { MaterialIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useThemeStore } from '../../store/themeStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import generateAttendanceToken, { getSecondsUntilNextToken } from '../../src/utils/tokenGenerator';
import { getStudentCount, changePassword, updateQRToken, clearQRToken, updateQRKey1, updateQRKey2, clearQRKey1, clearQRKey2, getAttendancePreview, saveAttendance, getScannedCount } from '../../src/services/api';

export default function TeacherProfileScreen() {
  const { user, logout } = useAuthStore();
  const { colors } = useThemeStore();
  const { 
    qrPhase, scannedCount, 
    setQrPhase, incrementScannedCount, resetFlow, setScannedCount 
  } = useAttendanceStore();
  const [lastScannedCount, setLastScannedCount] = useState(0);
  const [isQRModalVisible, setIsQRModalVisible] = useState(false);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [currentToken, setCurrentToken] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState({ presentCount: 0, absentCount: 5 });

  // Password state
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Timeouts and Refs
  const key2UpdateTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const key1ClearTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const key2ClearTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scanPollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (scanPollIntervalRef.current) clearInterval(scanPollIntervalRef.current);
      if (key2UpdateTimeout.current) clearTimeout(key2UpdateTimeout.current);
      if (key1ClearTimeout.current) clearTimeout(key1ClearTimeout.current);
      if (key2ClearTimeout.current) clearTimeout(key2ClearTimeout.current);
      
      console.log("Key 1 cleared");
      clearQRKey1().catch(() => {});
      console.log("Key 2 cleared");
      clearQRKey2().catch(() => {});
    };
  }, []);

  useEffect(() => {
    const fetchStudentCount = async () => {
      try {
        const data = await getStudentCount();
        setStudentCount(data.count);
      } catch (error) {
        console.error('Failed to fetch student count:', error);
      }
    };
    fetchStudentCount();
  }, []);



  useEffect(() => {
    if (isQRModalVisible) {
      // Initial generation
      const subject_id = user?.subject_id || '';
      const initialToken = generateAttendanceToken(subject_id);
      setCurrentToken(initialToken);
      
      const today = new Date();
      const dateStr = today.getFullYear() + "-" + 
        String(today.getMonth()+1).padStart(2,"0") + "-" +
        String(today.getDate()).padStart(2,"0");

      console.log("Key 1 updated:", initialToken);
      updateQRKey1(initialToken).catch(err => console.error('Failed to update Key 1:', err));

      key2UpdateTimeout.current = setTimeout(() => {
        console.log("Key 2 updated:", initialToken);
        updateQRKey2(initialToken).catch(err => console.error('Failed to update Key 2:', err));
      }, 5000);

      const initialSeconds = getSecondsUntilNextToken();
      setSecondsLeft(initialSeconds);

      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            const newToken = generateAttendanceToken(subject_id);
            setCurrentToken(newToken);
            
            console.log("Key 1 updated:", newToken);
            updateQRKey1(newToken).catch(err => console.error('Failed to update Key 1:', err));
            
            if (key2UpdateTimeout.current) clearTimeout(key2UpdateTimeout.current);
            key2UpdateTimeout.current = setTimeout(() => {
              console.log("Key 2 updated:", newToken);
              updateQRKey2(newToken).catch(err => console.error('Failed to update Key 2:', err));
            }, 5000);
            
            return 20;
          }
          return prev - 1;
        });
      }, 1000);

      // Start real-time scan polling
      const pollCount = async () => {
        try {
          const result = await getScannedCount(subject_id, dateStr);
          setScannedCount(result.count);
          setLastScannedCount(result.count);
        } catch (error) {
          console.error('Failed to poll scan count:', error);
        }
      };

      pollCount(); // Fetch immediately
      scanPollIntervalRef.current = setInterval(pollCount, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (scanPollIntervalRef.current) {
        clearInterval(scanPollIntervalRef.current);
        scanPollIntervalRef.current = null;
      }
    };
  }, [isQRModalVisible]);



  const handleShowPreview = async () => {
    try {
      setIsPreviewLoading(true);
      const today = new Date();
      const date = today.getFullYear() + "-" + 
        String(today.getMonth()+1).padStart(2,"0") + "-" +
        String(today.getDate()).padStart(2,"0");
      
      const data = await getAttendancePreview(user?.subject_id || '', date);
      setPreviewData(data);
      setIsConfirmationVisible(true);
    } catch (error) {
      console.error('Failed to fetch preview:', error);
      Alert.alert('Error', 'Failed to fetch attendance preview.');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleSaveAttendance = async () => {
    try {
      setIsConfirmationVisible(false);
      
      const today = new Date();
      const date = today.getFullYear() + "-" + 
        String(today.getMonth()+1).padStart(2,"0") + "-" +
        String(today.getDate()).padStart(2,"0");

      await saveAttendance(user?.subject_id || '', date);
      
      // Clear QR keys immediately
      clearQRKey1().catch(() => {});
      clearQRKey2().catch(() => {});
      
      resetFlow();
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 2000);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save attendance.');
    }
  };

  const handleCloseQR = () => {
    setIsQRModalVisible(false);
    setQrPhase(false);
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (key2UpdateTimeout.current) clearTimeout(key2UpdateTimeout.current);
    
    console.log("Key 1 cleared");
    clearQRKey1().catch(err => console.error('Failed to clear Key 1:', err));
    
    key1ClearTimeout.current = setTimeout(() => {
      console.log("Key 2 cleared");
      clearQRKey2().catch(err => console.error('Failed to clear Key 2:', err));
    }, 5000);
  };

  // Helper to get initials
  const getInitials = (name?: string) => {
    return name ? name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    if (!currentPassword || !newPassword) {
      setPasswordError('Please fill in both fields.');
      return;
    }
    if (!/^\d{4,}$/.test(newPassword)) {
      setPasswordError('New password must be at least 4 digits and only numbers.');
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError('New password cannot be the same as current password.');
      return;
    }
    try {
      setIsChangingPassword(true);
      if (!user?.email) throw new Error('User email not found.');
      await changePassword('teacher', user.email, currentPassword, newPassword);
      setIsPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert('Success', 'Password changed successfully!');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (key2UpdateTimeout.current) clearTimeout(key2UpdateTimeout.current);
    if (key1ClearTimeout.current) clearTimeout(key1ClearTimeout.current);
    if (key2ClearTimeout.current) clearTimeout(key2ClearTimeout.current);

    if (isQRModalVisible) {
      setIsQRModalVisible(false);
      console.log("Key 1 cleared");
      clearQRKey1().catch(err => console.error('Failed to clear Key 1 on logout:', err));
      console.log("Key 2 cleared");
      clearQRKey2().catch(err => console.error('Failed to clear Key 2 on logout:', err));
    }
    logout();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Card */}
        <View style={styles.profileSection}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </View>
          <Text style={[styles.nameText, { color: colors.text }]}>{user?.name || 'Teacher Name'}</Text>
          <Text style={[styles.emailText, { color: colors.subtext }]}>{user?.email || 'teacher@example.com'}</Text>
          <View style={[styles.departmentBadge, { backgroundColor: colors.inputBackground }]}>
             <Text style={[styles.departmentText, { color: colors.primary }]}>{user?.subject || 'Subject'}</Text>
          </View>
        </View>

        {/* Stats Card */}
        <View style={[styles.statsCard, { backgroundColor: colors.card, shadowColor: '#000' }]}>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{studentCount}</Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>Total Students</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[
              styles.primaryButton, 
              qrPhase ? { backgroundColor: colors.primary, shadowColor: colors.primary } 
                      : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1.5, shadowOpacity: 0, elevation: 0, opacity: 0.5 }
            ]} 
            onPress={() => setIsQRModalVisible(true)}
            disabled={!qrPhase}
          >
            <MaterialIcons name="qr-code" size={24} color={qrPhase ? "#FFFFFF" : colors.subtext} style={styles.btnIcon} />
            <Text style={qrPhase ? styles.primaryButtonText : [styles.secondaryButtonText, { color: colors.subtext }]}>
              {qrPhase ? 'Show QR Code' : 'QR Sent ✓'}
            </Text>
          </TouchableOpacity>

          {!qrPhase && (
            <View style={{ width: '100%', alignItems: 'center' }}>
              <Text style={{ textAlign: 'center', color: colors.subtext, marginBottom: 15, fontSize: 14, fontWeight: '500' }}>
                {lastScannedCount} students have scanned
              </Text>

              <TouchableOpacity 
                style={[styles.primaryButton, { backgroundColor: colors.badgeGreen, shadowColor: colors.badgeGreen, width: '100%' }]}
                onPress={handleShowPreview}
                disabled={isPreviewLoading}
              >
                {isPreviewLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialIcons name="check-circle" size={24} color="#FFFFFF" style={styles.btnIcon} />
                    <Text style={styles.primaryButtonText}>Save Attendance</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <View style={styles.spacer} />

        <View style={styles.spacer} />

        {/* Change Password Button */}
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 15 }]} 
          onPress={() => setIsPasswordModalVisible(true)}
        >
          <MaterialIcons name="lock-outline" size={20} color={colors.text} style={styles.btnIcon} />
          <Text style={[styles.logoutButtonText, { color: colors.text }]}>Change Password</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.badgeRed + '15', borderColor: colors.badgeRed + '40' }]} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color={colors.badgeRed} style={styles.btnIcon} />
          <Text style={[styles.logoutButtonText, { color: colors.badgeRed }]}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* QR Code Modal */}
      <Modal
        visible={isQRModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsQRModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPressOut={() => setIsQRModalVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Scan for Attendance</Text>
            
            <View style={[styles.qrContainer, { backgroundColor: '#FFFFFF', borderColor: colors.border, paddingBottom: 10 }]}>
              <QRCode
                value={currentToken || 'INITIALIZING'}
                size={220}
                color="#1F3864"
                backgroundColor="#FFFFFF"
              />
              <Text style={{ 
                marginTop: 15, 
                textAlign: 'center', 
                color: colors.subtext, 
                fontSize: 14, 
                fontWeight: '600' 
              }}>
                Refreshes in {secondsLeft}s
              </Text>
            </View>
            
            <Text style={[
              styles.modalSubText, 
              { color: scannedCount > 0 ? colors.badgeGreen : colors.subtext }
            ]}>
              {scannedCount === 0 ? "Waiting for students to scan..." : `${scannedCount} student(s) have scanned`}
            </Text>
            
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: colors.primary }]} 
              onPress={handleCloseQR}
            >
              <Text style={styles.closeButtonText}>Close QR</Text>
            </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        visible={isConfirmationVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsConfirmationVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.confirmModalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.confirmModalTitle, { color: colors.text }]}>Save Attendance</Text>
            <View style={{ marginBottom: 20, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, color: colors.badgeGreen, fontWeight: 'bold', marginBottom: 5 }}>
                ✓ {previewData.presentCount} students will be marked Present
              </Text>
              <Text style={{ fontSize: 16, color: colors.badgeRed, fontWeight: 'bold' }}>
                ✗ {previewData.absentCount} students will be marked Absent
              </Text>
            </View>
            
            <View style={styles.confirmButtonRow}>
              <TouchableOpacity 
                style={[styles.cancelButton, { borderColor: colors.badgeRed }]} 
                onPress={() => setIsConfirmationVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.badgeRed }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveConfirmButton, { backgroundColor: colors.primary }]} 
                onPress={handleSaveAttendance}
              >
                <Text style={styles.saveConfirmButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Toast Notification */}
      {showToast && (
        <View style={[styles.toastContainer, { backgroundColor: colors.badgeGreen }]}>
          <Text style={styles.toastText}>Attendance Saved!</Text>
        </View>
      )}

      {/* Password Change Modal */}
      <Modal
        visible={isPasswordModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', alignItems: 'center' }}>
            <View style={[styles.modalContent, { backgroundColor: colors.card, width: '90%' }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Change Password</Text>
              
              <View style={{ width: '100%', marginBottom: 15 }}>
                <Text style={{ color: colors.text, marginBottom: 6, fontWeight: '600', fontSize: 14 }}>Current Password</Text>
                <TextInput
                  style={{ width: '100%', borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, color: colors.text, backgroundColor: colors.inputBackground }}
                  secureTextEntry
                  keyboardType="numeric"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
              </View>

              <View style={{ width: '100%', marginBottom: 15 }}>
                <Text style={{ color: colors.text, marginBottom: 6, fontWeight: '600', fontSize: 14 }}>New Password <Text style={{fontWeight: 'normal', fontSize: 12, color: colors.subtext}}>(minimum 4 digits)</Text></Text>
                <TextInput
                  style={{ width: '100%', borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, color: colors.text, backgroundColor: colors.inputBackground }}
                  secureTextEntry
                  keyboardType="numeric"
                  value={newPassword}
                  onChangeText={(text) => { setNewPassword(text); setPasswordError(null); }}
                />
              </View>

              {passwordError && <Text style={{ color: colors.badgeRed, marginBottom: 15, textAlign: 'center' }}>{passwordError}</Text>}

              <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                <TouchableOpacity 
                  style={{ flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: 'center', marginRight: 10 }} 
                  onPress={() => { setIsPasswordModalVisible(false); setCurrentPassword(''); setNewPassword(''); setPasswordError(null); }}
                >
                  <Text style={{ color: colors.text, fontWeight: 'bold' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center' }} 
                  onPress={handleChangePassword}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Save</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA', // Light clean background
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1F3864',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#1F3864',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 10,
  },
  departmentBadge: {
    backgroundColor: '#E8EDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  departmentText: {
    fontSize: 14,
    color: '#1F3864',
    fontWeight: '600',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F3864',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  divider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 15,
  },
  actionsContainer: {
    width: '100%',
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#1F3864',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#1F3864',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  secondaryButtonText: {
    color: '#1F3864',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  btnIcon: {
    marginRight: 2,
  },
  spacer: {
    flex: 1,
    minHeight: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FFCDCD',
    width: '100%',
    marginBottom: 10,
  },
  logoutButtonText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  modalSubText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 30,
  },
  closeButton: {
    backgroundColor: '#1F3864',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  confirmModalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  confirmModalText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
  confirmButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D32F2F',
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#1F3864',
    alignItems: 'center',
    marginLeft: 10,
  },
  saveConfirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
