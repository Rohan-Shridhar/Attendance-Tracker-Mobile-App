import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  SafeAreaView,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { useStudentsStore } from '../../store/studentsStore';
import { useAuthStore } from '../../store/authStore';
import { getClassAttendance, sendLowAttendanceAlerts } from '../../src/services/api';

export default function TeacherStudentsScreen() {
  const { user } = useAuthStore();
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingAlerts, setIsSendingAlerts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { sortType, setSortType } = useStudentsStore();
  const { colors } = useThemeStore();

  const fetchStudents = async () => {
    if (!user?.subject_id) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await getClassAttendance(user.subject_id);
      setStudents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch students');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStudents();
  }, [user?.subject_id]);

  const handleSortChange = (type: 'name' | 'attendance') => {
    if (type !== sortType) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setSortType(type);
    }
  };

  const filteredStudents = [...students]
    .filter((student) => 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.usn.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortType === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return a.percentage - b.percentage; // Low to high for attendance
      }
    });

  const handleSendAlert = async () => {
    if (!user?.subject_id) return;

    try {
      setIsSendingAlerts(true);
      const result = await sendLowAttendanceAlerts(user.subject_id);
      
      let message = "";
      if (result.alertsSent > 0) {
        message = `Alerts sent to ${result.alertsSent} students below 75% attendance.`;
        if (result.alreadySentToday > 0) {
          message += ` (${result.alreadySentToday} students were already notified today)`;
        }
      } else if (result.alreadySentToday > 0) {
        message = "Alerts already sent to all eligible students today.";
      } else {
        message = "No students are currently below 75% attendance.";
      }

      Alert.alert('Alerts Status', message, [{ text: 'OK' }]);
    } catch (err: any) {
      console.error('Failed to send alerts:', err);
      Alert.alert('Error', err.message || 'Failed to send alerts. Please try again.');
    } finally {
      setIsSendingAlerts(false);
    }
  };

  const getBadgeColor = (percentage: number) => {
    if (percentage >= 75) return colors.badgeGreen;
    if (percentage >= 60) return colors.badgeYellow;
    return colors.badgeRed;
  };

  const getBadgeTextColor = (percentage: number) => {
    if (percentage >= 60 && percentage < 75) return '#333333';
    return '#FFFFFF'; 
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const renderStudentCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardLeft}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.email, { color: colors.subtext }]}>{item.usn}</Text>
        </View>
      </View>
      
      <View style={styles.cardRight}>
        <View 
          style={[
            styles.badge, 
            { backgroundColor: getBadgeColor(item.percentage) }
          ]}
        >
          <Text 
            style={[
              styles.badgeText, 
              { color: getBadgeTextColor(item.percentage) }
            ]}
          >
            {item.percentage}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Alert Banner Button */}
      <TouchableOpacity 
        style={[
          styles.alertBanner, 
          { backgroundColor: colors.badgeRed, shadowColor: colors.badgeRed },
          isSendingAlerts && { opacity: 0.8 }
        ]} 
        onPress={handleSendAlert}
        disabled={isSendingAlerts}
      >
        {isSendingAlerts ? (
          <ActivityIndicator color="#FFFFFF" size="small" style={styles.alertIcon} />
        ) : (
          <MaterialIcons name="warning" size={24} color="#FFFFFF" style={styles.alertIcon} />
        )}
        <Text style={styles.alertText}>
          {isSendingAlerts ? 'Sending Alerts...' : 'Send Alert to All Below 75%'}
        </Text>
      </TouchableOpacity>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
        <MaterialIcons name="search" size={20} color={colors.subtext} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search students by name..."
          placeholderTextColor={colors.subtext}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Sort Controls */}
      <View style={styles.sortContainer}>
        <TouchableOpacity 
          style={[styles.sortButton, sortType === 'name' ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: 'transparent', borderColor: colors.border }]}
          onPress={() => handleSortChange('name')}
        >
          <Text style={[styles.sortButtonText, { color: sortType === 'name' ? '#FFFFFF' : colors.text }]}>Name</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sortButton, sortType === 'attendance' ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: 'transparent', borderColor: colors.border }]}
          onPress={() => handleSortChange('attendance')}
        >
          <Text style={[styles.sortButtonText, { color: sortType === 'attendance' ? '#FFFFFF' : colors.text }]}>Attendance</Text>
        </TouchableOpacity>
      </View>

      {/* Student List */}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 10, color: colors.subtext }}>Loading students...</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <MaterialIcons name="error-outline" size={48} color={colors.badgeRed} />
          <Text style={{ marginTop: 10, color: colors.text, textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity 
            style={[styles.sortButton, { backgroundColor: colors.primary, marginTop: 20, paddingHorizontal: 30 }]}
            onPress={fetchStudents}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item.usn}
          renderItem={renderStudentCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.subtext }]}>No students found.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  alertBanner: {
    flexDirection: 'row',
    backgroundColor: '#D32F2F', // Red banner
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  alertIcon: {
    marginRight: 8,
  },
  alertText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  sortContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1F3864',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
  },
  email: {
    fontSize: 13,
    color: '#8E8E93',
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#8E8E93',
    fontSize: 16,
  },
});
