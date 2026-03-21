import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

interface Notification {
  id: string;
  type: 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

const INITIAL_MOCKS: Notification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Absence Alert — Data Structures',
    message: 'Your attendance in Data Structures has dropped below 75%. Please attend classes regularly.',
    timestamp: '2 hours ago',
    isRead: false,
  },
  {
    id: '2',
    type: 'info',
    title: 'Class Rescheduled',
    message: 'Operating Systems lecture has been moved to 3:00 PM today in Auditorium A.',
    timestamp: '5 hours ago',
    isRead: false,
  },
  {
    id: '3',
    type: 'info',
    title: 'New Material Uploaded',
    message: 'Prof. Andrew Ng has uploaded slides for Machine Learning Week 4.',
    timestamp: '1 day ago',
    isRead: true,
  },
  {
    id: '4',
    type: 'warning',
    title: 'Missing Assignment',
    message: 'You have a pending assignment for Databases due tomorrow.',
    timestamp: '2 days ago',
    isRead: true,
  },
  {
    id: '5',
    type: 'info',
    title: 'Welcome to AttendX',
    message: 'Your profile has been successfully set up. Make sure to enable Bluetooth during class.',
    timestamp: '1 week ago',
    isRead: true,
  },
];

export default function StudentInboxScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_MOCKS);
  const navigation = useNavigation();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    // Dynamically update the parent Tab bar badge
    navigation.setOptions({
      tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
    });
  }, [unreadCount, navigation]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      style={[styles.card, !item.isRead && styles.cardUnread]}
      onPress={() => markAsRead(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <MaterialIcons 
          name={item.type === 'warning' ? 'warning' : 'info'} 
          size={28} 
          color={item.type === 'warning' ? '#F44336' : '#2196F3'} 
        />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, !item.isRead && styles.textUnread]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        <Text style={styles.message} numberOfLines={3}>
          {item.message}
        </Text>
      </View>
      {/* Optional extra indicator for purely unread items */}
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
            <MaterialIcons name="done-all" size={20} color="#1F3864" />
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F3864',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8EDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F3864',
    marginLeft: 4,
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#1F3864',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    position: 'relative',
  },
  cardUnread: {
    backgroundColor: '#E3F2FD', // Light blue tint
    borderColor: '#90CAF9',
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  textUnread: {
    fontWeight: 'bold',
    color: '#1F3864',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2196F3',
    borderWidth: 2,
    borderColor: '#E3F2FD',
  },
});
