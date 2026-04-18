import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { getNotifications, markAsRead, markAllRead } from '../../src/services/api';
import { useNavigation } from 'expo-router';

interface Notification {
  _id: string;
  usn: string;
  type: "absent_alert" | "low_attendance_alert";
  subject: string;
  subject_id: string;
  date: string;
  attendance_percentage: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function StudentInboxScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { colors } = useThemeStore();
  const { user } = useAuthStore();
  const { setUnreadCount } = useNotificationStore();
  const navigation = useNavigation();

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (!user?.usn) return;
    
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await getNotifications(user.usn);
      setNotifications(data);
      
      // Update global unread count
      const unread = data.filter((n: Notification) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.usn, setUnreadCount]);

  const handleMarkAllRead = async () => {
    if (!user?.usn || notifications.every(n => n.is_read)) return;
    
    try {
      await markAllRead(user.usn);
      // Update local state silenty
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    const notification = notifications.find(n => n._id === id);
    if (!notification || notification.is_read) return;

    try {
      await markAsRead(id);
      // Update local state
      setNotifications(prev => {
        const updated = prev.map(n => n._id === id ? { ...n, is_read: true } : n);
        const unread = updated.filter(n => !n.is_read).length;
        setUnreadCount(unread);
        return updated;
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Set header button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          onPress={handleMarkAllRead} 
          style={{ marginRight: 15 }}
          disabled={notifications.every(n => n.is_read)}
        >
          <Text style={{ 
            color: '#FFF', 
            fontWeight: '600',
            opacity: notifications.every(n => n.is_read) ? 0.6 : 1 
          }}>
            Mark All Read
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, notifications]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => handleMarkAsRead(item._id)}
      style={[
        styles.card, 
        { 
          backgroundColor: item.is_read ? colors.card : (colors.badgeRed + '15'),
          borderLeftColor: item.is_read ? colors.border : colors.badgeRed,
          borderLeftWidth: 4
        }
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons 
          name="warning-outline" 
          size={24} 
          color={item.is_read ? colors.subtext : colors.badgeRed} 
        />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={[
            styles.title, 
            { color: colors.text, opacity: item.is_read ? 0.8 : 1 }
          ]} numberOfLines={1}>
            Absent — {item.subject}
          </Text>
          <Text style={[styles.timestamp, { color: colors.subtext }]}>
            {formatDate(item.created_at)}
          </Text>
        </View>
        <Text style={[
          styles.message, 
          { color: colors.subtext, opacity: item.is_read ? 0.7 : 1 }
        ]} numberOfLines={3}>
          {item.message}
        </Text>
      </View>
      {!item.is_read && <View style={[styles.unreadDot, { backgroundColor: colors.badgeRed }]} />}
    </TouchableOpacity>
  );

  if (isLoading && !isRefreshing) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={() => fetchNotifications(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={80} color={colors.badgeGreen} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No absence alerts</Text>
            <Text style={[styles.emptySubText, { color: colors.subtext }]}>
              Your attendance looks great! We'll notify you here if you miss any upcoming classes.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '500',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
