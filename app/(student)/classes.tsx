import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type Tab = 'Today' | 'This Week' | 'All';
type AttendanceStatus = 'Present' | 'Absent' | 'Upcoming';

interface ClassData {
  id: string;
  subject: string;
  code: string;
  teacher: string;
  time: string;
  room: string;
  status: AttendanceStatus;
  category: Tab[];
}

const MOCK_CLASSES: ClassData[] = [
  { id: '1', subject: 'Data Structures', code: 'CS201', teacher: 'Dr. Alan Turing', time: '10:00 AM - 11:30 AM', room: 'Room 304', status: 'Present', category: ['Today', 'This Week', 'All'] },
  { id: '2', subject: 'Databases', code: 'CS301', teacher: 'Prof. Ada Lovelace', time: '01:00 PM - 02:00 PM', room: 'Lab 2', status: 'Upcoming', category: ['Today', 'This Week', 'All'] },
  { id: '3', subject: 'Operating Systems', code: 'CS401', teacher: 'Dr. Linus Torvalds', time: '11:00 AM - 12:30 PM', room: 'Room 101', status: 'Absent', category: ['This Week', 'All'] },
  { id: '4', subject: 'Computer Networks', code: 'CS405', teacher: 'Dr. Vint Cerf', time: '09:00 AM - 10:00 AM', room: 'Room 205', status: 'Present', category: ['This Week', 'All'] },
  { id: '5', subject: 'Machine Learning', code: 'CS501', teacher: 'Prof. Andrew Ng', time: '02:00 PM - 04:00 PM', room: 'Auditorium A', status: 'Upcoming', category: ['All'] },
  { id: '6', subject: 'Software Engineering', code: 'CS305', teacher: 'Dr. Margaret Hamilton', time: '10:00 AM - 11:00 AM', room: 'Room 501', status: 'Present', category: ['All'] },
];

export default function StudentClassesScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('Today');

  const filteredClasses = MOCK_CLASSES.filter(c => c.category.includes(activeTab));

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'Present': return '#4CAF50';
      case 'Absent': return '#D32F2F';
      case 'Upcoming': return '#2196F3';
      default: return '#666';
    }
  };

  const renderClassCard = ({ item }: { item: ClassData }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={styles.subjectInfo}>
          <Text style={styles.subjectName}>{item.subject}</Text>
          <Text style={styles.subjectCode}>{item.code}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={16} color="#666" style={styles.icon} />
          <Text style={styles.infoText}>{item.teacher}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="schedule" size={16} color="#666" style={styles.icon} />
          <Text style={styles.infoText}>{item.time}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="room" size={16} color="#666" style={styles.icon} />
          <Text style={styles.infoText}>{item.room}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Row */}
      <View style={styles.tabContainer}>
        {(['Today', 'This Week', 'All'] as Tab[]).map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Class List */}
      <FlatList
        data={filteredClasses}
        keyExtractor={(item) => item.id}
        renderItem={renderClassCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="event-busy" size={48} color="#C7C7CC" />
            <Text style={styles.emptyText}>No classes scheduled for {activeTab.toLowerCase()}.</Text>
          </View>
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#1F3864',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#1F3864',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#1F3864',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8EDF5',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subjectInfo: {
    flex: 1,
    paddingRight: 10,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subjectCode: {
    fontSize: 14,
    color: '#1F3864',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 12,
  },
  cardBody: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
    width: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
});
