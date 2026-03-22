import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  SafeAreaView, 
  ScrollView,
  Animated,
  Button,
  TouchableWithoutFeedback
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function StudentProfileScreen() {
  const { user, logout } = useAuthStore();
  const [isBeaconActive, setIsBeaconActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Animation for bluetooth pulse
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  // Start pulsing animation when beacon is active
  useEffect(() => {
    if (isBeaconActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isBeaconActive, pulseAnim]);

  const handleScanQRCode = () => {
    if (!permission?.granted) {
      requestPermission();
    } else {
      setIsScanning(true);
    }
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setIsScanning(false);
    setSuccessMessage(`Attendance Marked!\nScanned: ${data}`);
    setSuccessModalVisible(true);
  };

  const handleMarkPresent = () => {
    setSuccessMessage('Attendance Marked via Bluetooth!');
    setSuccessModalVisible(true);
  };

  const getInitials = (name?: string) => {
    return name ? name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  };

  const subjects = [
    { id: '1', name: 'DS', percentage: 80 },
    { id: '2', name: 'DBMS', percentage: 60 },
    { id: '3', name: 'OOPS', percentage: 45 },
    { id: '4', name: 'OS', percentage: 78 },
    { id: '5', name: 'CN', percentage: 72 },
  ];

  const getBadgeColor = (percentage: number) => {
    if (percentage >= 75) return { bg: '#E8F5E9', text: '#2E7D32' };
    if (percentage >= 60) return { bg: '#FFF8E1', text: '#F57F17' };
    return { bg: '#FFEBEE', text: '#C62828' };
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Card */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </View>
          <Text style={styles.nameText}>{user?.name || 'Student Name'}</Text>
          <Text style={styles.emailText}>{user?.email || 'student@example.com'}</Text>
          <View style={styles.enrollmentBadge}>
             <Text style={styles.enrollmentText}>EN2024001</Text>
          </View>
        </View>

        {/* Subjects List */}
        <View style={styles.subjectsContainer}>
          <Text style={styles.sectionTitle}>My Subjects</Text>
          {subjects.map((subject) => {
            const colors = getBadgeColor(subject.percentage);
            return (
              <TouchableOpacity 
                key={subject.id} 
                style={styles.subjectCard}
                onPress={() => console.log(`Tapped ${subject.name}`)}
              >
                <View style={styles.subjectIcon}>
                  <Text style={styles.subjectIconText}>{subject.name.substring(0, 1)}</Text>
                </View>
                <Text style={styles.subjectName}>{subject.name}</Text>
                <View style={[styles.badge, { backgroundColor: colors.bg }]}>
                  <Text style={[styles.badgeText, { color: colors.text }]}>
                    {subject.percentage}%
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Actions Section */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleScanQRCode}>
            <MaterialIcons name="qr-code-scanner" size={24} color="#FFF" style={styles.btnIcon} />
            <Text style={styles.primaryButtonText}>Scan QR Code</Text>
          </TouchableOpacity>

          {/* Bluetooth Pill Toggle */}
          <TouchableOpacity 
            style={[styles.btPill, isBeaconActive ? styles.btPillActive : styles.btPillInactive]} 
            onPress={() => setIsBeaconActive(!isBeaconActive)}
          >
            <Animated.View style={{ opacity: isBeaconActive ? pulseAnim : 1 }}>
              <MaterialIcons 
                name={isBeaconActive ? "bluetooth-searching" : "bluetooth-disabled"} 
                size={22} 
                color={isBeaconActive ? "#FFF" : "#666"} 
                style={styles.btIconPill} 
              />
            </Animated.View>
            <Text style={isBeaconActive ? styles.btPillTextActive : styles.btPillTextInactive}>
              {isBeaconActive ? 'BT Scanning...' : 'Bluetooth Off'}
            </Text>
          </TouchableOpacity>

          {/* Mark Present Button - ONLY visible if BT is Active */}
          {isBeaconActive && (
            <TouchableOpacity style={styles.markPresentButton} onPress={handleMarkPresent}>
              <MaterialIcons name="how-to-reg" size={24} color="#FFF" style={styles.btnIcon} />
              <Text style={styles.primaryButtonText}>Mark Present</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.spacer} />

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <MaterialIcons name="logout" size={20} color="#D32F2F" style={styles.btnIcon} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* QR Scanner Modal */}
      <Modal visible={isScanning} animationType="slide">
        <SafeAreaView style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitle}>Scan QR Code</Text>
            <TouchableOpacity onPress={() => setIsScanning(false)}>
              <MaterialIcons name="close" size={28} color="#FFF" />
            </TouchableOpacity>
          </View>
          {permission?.granted ? (
            <CameraView
              style={styles.camera}
              facing="back"
              onBarcodeScanned={handleBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
            >
              <View style={styles.overlay}>
                <View style={styles.scanFrame} />
              </View>
            </CameraView>
          ) : (
            <View style={styles.permissionContainer}>
              <Text style={styles.permissionText}>We need your permission to show the camera</Text>
              <Button onPress={requestPermission} title="Grant permission" />
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPressOut={() => setSuccessModalVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
            <MaterialIcons name="check-circle" size={60} color="#4CAF50" style={{ marginBottom: 15 }} />
            <Text style={styles.modalTitle}>Success!</Text>
            <Text style={styles.modalSubText}>{successMessage}</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setSuccessModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1F3864',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#1F3864',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 10,
  },
  enrollmentBadge: {
    backgroundColor: '#E8EDF5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C5D6F0',
  },
  enrollmentText: {
    fontSize: 13,
    color: '#1F3864',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  subjectsContainer: {
    width: '100%',
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  subjectIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E8EDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  subjectIconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F3864',
  },
  subjectName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#1F3864',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 15,
    shadowColor: '#1F3864',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  btnIcon: {
    marginRight: 4,
  },
  btPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  btPillInactive: {
    backgroundColor: '#E0E0E0',
  },
  btPillActive: {
    backgroundColor: '#2196F3',
    shadowColor: '#2196F3',
    shadowOpacity: 0.3,
  },
  btIconPill: {
    marginRight: 8,
  },
  btPillTextInactive: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 14,
  },
  btPillTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  markPresentButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  spacer: {
    flex: 1,
    minHeight: 30,
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
  },
  logoutButtonText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  scannerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: 'transparent',
    borderRadius: 10,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFF',
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalSubText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
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
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
