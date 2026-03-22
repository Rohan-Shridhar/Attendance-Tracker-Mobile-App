import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
}

const INITIAL_MOCKS: Notification[] = [
  {
    id: '1',
    title: 'Absence Alert — DBMS',
    message: 'Your attendance in DBMS has dropped below 75%. Please attend regularly.',
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    title: 'Absence Alert — OOPS',
    message: 'Your attendance in OOPS has dropped below 75%. Please attend regularly.',
    timestamp: '1 day ago',
  },
  {
    id: '3',
    title: 'Absence Alert — CN',
    message: 'Your attendance in CN has dropped below 75%. Please attend regularly.',
    timestamp: '3 days ago',
  },
];

export default function StudentInboxScreen() {
  const notifications = INITIAL_MOCKS;
  const { colors } = useThemeStore();

  const renderNotification = ({ item }: { item: Notification }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.iconContainer}>
        <MaterialIcons name="warning" size={28} color={colors.badgeRed} />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.timestamp, { color: colors.subtext }]}>{item.timestamp}</Text>
        </View>
        <Text style={[styles.message, { color: colors.subtext }]} numberOfLines={3}>
          {item.message}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Notifications</Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
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
    flex: 1,
    marginRight: 10,
  },
  timestamp: {
    fontSize: 12,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
});
