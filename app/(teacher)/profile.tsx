import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView, ScrollView, TouchableWithoutFeedback, Animated } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { MaterialIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useThemeStore } from '../../store/themeStore';

export default function TeacherProfileScreen() {
  const { user, logout } = useAuthStore();
  const { colors } = useThemeStore();
  const [isBeaconActive, setIsBeaconActive] = useState(false);
  const [isQRModalVisible, setIsQRModalVisible] = useState(false);
  const [studentCount, setStudentCount] = useState(0);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const PulseRings = ({ isActive, color }: { isActive: boolean, color: string }) => {
    const ring1 = React.useRef(new Animated.Value(0)).current;
    const ring2 = React.useRef(new Animated.Value(0)).current;
    const ring3 = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (isActive) {
        const startAnim = (anim: Animated.Value) => {
          anim.setValue(0);
          Animated.loop(
            Animated.timing(anim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            })
          ).start();
        };

        startAnim(ring1);
        const t1 = setTimeout(() => startAnim(ring2), 500);
        const t2 = setTimeout(() => startAnim(ring3), 1000);

        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
          ring1.stopAnimation();
          ring2.stopAnimation();
          ring3.stopAnimation();
          ring1.setValue(0);
          ring2.setValue(0);
          ring3.setValue(0);
        };
      }
    }, [isActive]);

    if (!isActive) return null;

    const renderRing = (anim: Animated.Value) => (
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: color,
          opacity: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.6, 0],
          }),
          transform: [
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 2.5],
              }),
            },
          ],
        }}
      />
    );

    return (
      <View 
        pointerEvents="none" 
        style={{ 
          position: 'absolute', 
          width: 120, 
          height: 120, 
          justifyContent: 'center', 
          alignItems: 'center', 
          overflow: 'hidden' 
        }}
      >
        <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center', overflow: 'visible' }}>
          {renderRing(ring1)}
          {renderRing(ring2)}
          {renderRing(ring3)}
        </View>
      </View>
    );
  };


  useEffect(() => {
    let timer: any;
    if (isBeaconActive) {
      setStudentCount(0);
      timer = setTimeout(() => {
        setStudentCount(3);
      }, 2000);
    } else {
      setStudentCount(0);
    }
    return () => clearTimeout(timer);
  }, [isBeaconActive]);

  const handleSaveAttendance = () => {
    setIsConfirmationVisible(false);
    setIsBeaconActive(false);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  // Helper to get initials
  const getInitials = (name?: string) => {
    return name ? name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
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
             <Text style={[styles.departmentText, { color: colors.primary }]}>Computer Science</Text>
          </View>
        </View>

        {/* Stats Card */}
        <View style={[styles.statsCard, { backgroundColor: colors.card, shadowColor: '#000' }]}>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>3</Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>Classes Today</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>145</Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>Total Students</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
            onPress={() => setIsQRModalVisible(true)}
          >
            <MaterialIcons name="qr-code" size={24} color="#FFFFFF" style={styles.btnIcon} />
            <Text style={styles.primaryButtonText}>Generate QR Code</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.primaryButton, isBeaconActive ? { backgroundColor: colors.badgeGreen, shadowColor: colors.badgeGreen } : { backgroundColor: colors.card, borderColor: colors.primary, borderWidth: 1.5, shadowOpacity: 0, elevation: 0 }]} 
            onPress={() => setIsBeaconActive(!isBeaconActive)}
          >
            <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center', marginRight: 4 }}>
              <PulseRings isActive={isBeaconActive} color={colors.primary} />
              <MaterialIcons 
                name={isBeaconActive ? "bluetooth-connected" : "bluetooth"} 
                size={24} 
                color={isBeaconActive ? "#FFFFFF" : colors.primary} 
              />
            </View>
            <Text style={isBeaconActive ? styles.primaryButtonText : [styles.secondaryButtonText, { color: colors.primary }]}>
              {isBeaconActive ? 'Beacon Active' : 'Turn On Bluetooth Beacon'}
            </Text>
          </TouchableOpacity>

          {isBeaconActive && (
            <View style={[styles.beaconCard, { backgroundColor: colors.inputBackground }]}>
              <Text style={[styles.beaconText, { color: colors.primary }]}>{studentCount} students connected</Text>
              <TouchableOpacity 
                style={[styles.saveAttendanceBtn, { backgroundColor: colors.badgeGreen }]}
                disabled={studentCount === 0}
                onPress={() => setIsConfirmationVisible(true)}
              >
                <Text style={styles.saveAttendanceBtnText}>Save Attendance</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <View style={styles.spacer} />

        {/* Logout Button */}
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.badgeRed + '15', borderColor: colors.badgeRed + '40' }]} onPress={logout}>
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
            
            <View style={[styles.qrContainer, { backgroundColor: '#FFFFFF', borderColor: colors.border }]}>
              <QRCode
                value="SESSION-MOCK-001"
                size={220}
                color="#1F3864"
                backgroundColor="#FFFFFF"
              />
            </View>
            
            <Text style={[styles.modalSubText, { color: colors.subtext }]}>Session ID: SESSION-MOCK-001</Text>
            
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: colors.primary }]} 
              onPress={() => setIsQRModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
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
            <Text style={[styles.confirmModalTitle, { color: colors.text }]}>Confirm Attendance</Text>
            <Text style={[styles.confirmModalText, { color: colors.subtext }]}>{studentCount} students will be marked present</Text>
            
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
  beaconOffBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#1F3864',
    shadowOpacity: 0,
    elevation: 0,
  },
  beaconActiveBtn: {
    backgroundColor: '#4CAF50', // Green for active status
    shadowColor: '#4CAF50',
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
  beaconCard: {
    backgroundColor: '#E8EDF5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 15,
  },
  beaconText: {
    fontSize: 16,
    color: '#1F3864',
    fontWeight: '600',
    marginBottom: 12,
  },
  saveAttendanceBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  saveAttendanceBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
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
