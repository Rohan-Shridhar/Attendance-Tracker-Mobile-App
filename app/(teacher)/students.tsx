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
  UIManager
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { useStudentsStore } from '../../store/studentsStore';

// Mock Data
const MOCK_STUDENTS = [
  { id: '1', name: 'Alice Johnson', email: 'alice.j@student.edu', attendance: 85 },
  { id: '2', name: 'Bob Smith', email: 'bob.s@student.edu', attendance: 65 },
  { id: '3', name: 'Charlie Williams', email: 'charlie.w@student.edu', attendance: 55 },
  { id: '4', name: 'Diana King', email: 'diana.k@student.edu', attendance: 92 },
  { id: '5', name: 'Evan Davis', email: 'evan.d@student.edu', attendance: 40 },
  { id: '6', name: 'Fiona Garcia', email: 'fiona.g@student.edu', attendance: 78 },
];

export default function TeacherStudentsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { sortType, setSortType } = useStudentsStore();
  const { colors } = useThemeStore();

  const handleSortChange = (type: 'name' | 'attendance') => {
    if (type !== sortType) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setSortType(type);
    }
  };

  const filteredStudents = [...MOCK_STUDENTS]
    .filter((student) => 
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortType === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return a.attendance - b.attendance;
      }
    });

  const handleSendAlert = () => {
    // Count students with attendance < 75%
    const count = MOCK_STUDENTS.filter(s => s.attendance < 75).length;
    Alert.alert(
      'Alerts Sent',
      `Alerts logically sent to ${count} students.`,
      [{ text: 'OK' }]
    );
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

  const renderStudentCard = ({ item }: { item: typeof MOCK_STUDENTS[0] }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardLeft}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{item.name[0]}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.email, { color: colors.subtext }]}>{item.email}</Text>
        </View>
      </View>
      
      <View style={styles.cardRight}>
        <View 
          style={[
            styles.badge, 
            { backgroundColor: getBadgeColor(item.attendance) }
          ]}
        >
          <Text 
            style={[
              styles.badgeText, 
              { color: getBadgeTextColor(item.attendance) }
            ]}
          >
            {item.attendance}%
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={colors.subtext} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Alert Banner Button */}
      <TouchableOpacity style={[styles.alertBanner, { backgroundColor: colors.badgeRed, shadowColor: colors.badgeRed }]} onPress={handleSendAlert}>
        <MaterialIcons name="warning" size={24} color="#FFFFFF" style={styles.alertIcon} />
        <Text style={styles.alertText}>Send Alert to All Below 75%</Text>
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
      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.id}
        renderItem={renderStudentCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.subtext }]}>No students found.</Text>
        }
      />
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
