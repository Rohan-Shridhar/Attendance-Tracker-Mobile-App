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
  TouchableWithoutFeedback,
  Alert,
  Linking,
  Platform
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore'; // Added this import
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useStudentAttendanceStore } from '../../store/studentAttendanceStore';
import generateAttendanceToken from '../../src/utils/tokenGenerator';


export default function StudentProfileScreen() {
  const { user, logout } = useAuthStore();
  const { colors } = useThemeStore();
  const router = useRouter();

  const {
    attendanceSaved,
    setAttendanceSaved
  } = useStudentAttendanceStore();

  const [permission, requestPermission] = useCameraPermissions();
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  
  const [attendanceSavedModalVisible, setAttendanceSavedModalVisible] = useState(false);
  const [scannedToken, setScannedToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isVerificationError, setIsVerificationError] = useState(false);

  const scanLineAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isScannerVisible) {
      scanLineAnim.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 246,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      scanLineAnim.stopAnimation();
    }
  }, [isScannerVisible, scanLineAnim]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isValidating) {
      timer = setTimeout(() => {
        // Verification logic
        const currentToken = generateAttendanceToken();
        const previousToken = generateAttendanceToken(new Date(Date.now() - 20000));
        
        if (scannedToken === currentToken || scannedToken === previousToken) {
          setIsVerificationError(false);
        } else {
          setIsVerificationError(true);
        }
        
        setIsValidating(false);
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [isValidating, scannedToken]);



  const handleScanQRCode = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Permission Required",
          "Camera permission is required to scan QR codes",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }
    }
    setIsScannerVisible(true);
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setIsScannerVisible(false);
    setScannedToken(data);
    setIsValidating(true);
    setAttendanceSavedModalVisible(true);
  };

  const handleAttendanceSavedOK = () => {
    setAttendanceSavedModalVisible(false);
    if (!isVerificationError) {
      setAttendanceSaved(true);
    }
    // Reset error state for next scan
    setTimeout(() => setIsVerificationError(false), 300);
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
    if (percentage >= 75) return { bg: colors.badgeGreen + '33', text: colors.badgeGreen };
    if (percentage >= 60) return { bg: colors.badgeYellow + '33', text: colors.badgeYellow };
    return { bg: colors.badgeRed + '33', text: colors.badgeRed };
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar hidden={isScannerVisible} />
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Profile Card */}
        <View style={styles.profileSection}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </View>
          <Text style={[styles.nameText, { color: colors.text }]}>{user?.name || 'Student Name'}</Text>
          <Text style={[styles.emailText, { color: colors.subtext }]}>{user?.email || 'student@example.com'}</Text>
          <View style={[styles.enrollmentBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
             <Text style={[styles.enrollmentText, { color: colors.primary }]}>EN2024001</Text>
          </View>
        </View>

        {/* Subjects List */}
        <View style={styles.subjectsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>My Subjects</Text>
          {subjects.map((subject) => {
            const subjectColors = getBadgeColor(subject.percentage);
            return (
              <TouchableOpacity
                key={subject.id}
                style={[styles.subjectCard, { backgroundColor: colors.card, shadowColor: colors.primary }]}
                onPress={() => router.push({ pathname: '/(student)/subject', params: { name: subject.name, percentage: subject.percentage } })}
              >
                <View style={[styles.subjectIcon, { backgroundColor: colors.inputBackground }]}>
                  <Text style={[styles.subjectIconText, { color: colors.primary }]}>{subject.name.substring(0, 1)}</Text>
                </View>
                <Text style={[styles.subjectName, { color: colors.text }]}>{subject.name}</Text>
                <View style={[styles.badge, { backgroundColor: subjectColors.bg }]}>
                  <Text style={[styles.badgeText, { color: subjectColors.text }]}>
                    {subject.percentage}%
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Actions Section */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
            onPress={handleScanQRCode}
          >
            <MaterialIcons name="qr-code-scanner" size={24} color="#FFFFFF" style={styles.btnIcon} />
            <Text style={styles.primaryButtonText}>Scan Teacher QR</Text>
          </TouchableOpacity>

          {attendanceSaved && (
             <Text style={{ textAlign: 'center', color: colors.badgeGreen, marginTop: 5, fontSize: 14, fontWeight: 'bold' }}>
               Attendance saved for today ✓
             </Text>
          )}
        </View>

        <View style={styles.spacer} />
        {/* Logout Button */}
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.badgeRed + '11', borderColor: colors.badgeRed + '44' }]} onPress={logout}>
          <MaterialIcons name="logout" size={20} color={colors.badgeRed} style={styles.btnIcon} />
          <Text style={[styles.logoutButtonText, { color: colors.badgeRed }]}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* QR Code Scanner Modal */}
      <Modal
        visible={isScannerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsScannerVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          >
            <View style={{ flex: 1 }}>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />
              <View style={{ flexDirection: 'row', height: 250 }}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />
                <View style={{ width: 250, height: 250, borderColor: colors.primary, borderWidth: 2, backgroundColor: 'transparent', overflow: 'hidden' }}>
                  <Animated.View style={{
                    width: '100%',
                    height: 4,
                    backgroundColor: colors.primary,
                    transform: [{ translateY: scanLineAnim }]
                  }} />
                </View>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />
              </View>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity 
                  style={[styles.mockScanButton, { backgroundColor: colors.primary, width: 200 }]} 
                  onPress={() => setIsScannerVisible(false)}
                >
                  <Text style={styles.mockScanText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        </View>
      </Modal>



      <Modal
        visible={attendanceSavedModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
           <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
             {isValidating ? (
               <>
                 <MaterialIcons name="qr-code" size={50} color={colors.primary} style={{ marginBottom: 15 }} />
                 <Text style={[styles.modalTitle, { color: colors.text }]}>QR Scanned</Text>
                 <View style={[styles.tokenContainer, { backgroundColor: colors.inputBackground }]}>
                   <Text style={[styles.monospaceToken, { color: colors.text }]}>{scannedToken}</Text>
                 </View>
                 <Text style={[styles.modalSubText, { color: colors.subtext, marginTop: 10 }]}>Token received — verifying...</Text>
               </>
             ) : isVerificationError ? (
               <>
                 <MaterialIcons name="error-outline" size={50} color={colors.badgeRed} style={{ marginBottom: 15 }} />
                 <Text style={[styles.modalTitle, { color: colors.text }]}>Invalid QR Code</Text>
                 <Text style={[styles.modalSubText, { color: colors.subtext }]}>
                   This QR code has expired or is not valid. Ask your teacher to show the QR code again.
                 </Text>
                 <TouchableOpacity 
                   style={[styles.closeButton, { backgroundColor: colors.primary }]} 
                   onPress={handleAttendanceSavedOK}
                 >
                   <Text style={styles.closeButtonText}>OK</Text>
                 </TouchableOpacity>
               </>
             ) : (
               <>
                 <MaterialIcons name="check-circle" size={50} color={colors.badgeGreen} style={{ marginBottom: 15 }} />
                 <Text style={[styles.modalTitle, { color: colors.text }]}>Attendance Marked!</Text>
                 <Text style={[styles.modalSubText, { color: colors.subtext }]}>Token verified successfully.</Text>
                 <TouchableOpacity 
                   style={[styles.closeButton, { backgroundColor: colors.primary }]} 
                   onPress={handleAttendanceSavedOK}
                 >
                   <Text style={styles.closeButtonText}>OK</Text>
                 </TouchableOpacity>
               </>
             )}
           </View>
        </View>
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
  mockScanButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  mockScanText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tokenContainer: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  monospaceToken: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
