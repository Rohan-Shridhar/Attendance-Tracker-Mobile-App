import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { getStudentSubjectDetail } from '../../src/services/api';

export default function SubjectDetailScreen() {
  const { name, percentage, subjectId } = useLocalSearchParams<{ name: string; percentage: string; subjectId: string; }>();
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuthStore();
  const { colors } = useThemeStore();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.usn || !subjectId) return;
      try {
        setIsLoading(true);
        setError(null);
        const data = await getStudentSubjectDetail(user.usn, subjectId);
        setRecords(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch attendance history');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [user?.usn, subjectId]);
  
  const pct = parseInt(percentage || '0', 10);
  
  let badgeColor = { bg: colors.badgeRed + '33', text: colors.badgeRed };
  if (pct >= 75) badgeColor = { bg: colors.badgeGreen + '33', text: colors.badgeGreen };
  else if (pct >= 60) badgeColor = { bg: colors.badgeYellow + '33', text: colors.badgeYellow };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Info */}
      <View style={[styles.headerCard, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.subjectName, { color: colors.primary }]}>{name || 'Subject'}</Text>
          <View style={[styles.badge, { backgroundColor: badgeColor.bg }]}>
            <Text style={[styles.badgeText, { color: badgeColor.text }]}>{pct}%</Text>
          </View>
        </View>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>Recent Attendance Records</Text>
      </View>

      {/* Records List */}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 10, color: colors.subtext }}>Loading records...</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <MaterialIcons name="error-outline" size={48} color={colors.badgeRed} />
          <Text style={{ marginTop: 10, color: colors.text, textAlign: 'center' }}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
              <MaterialIcons name="event-busy" size={60} color={colors.subtext + '44'} />
              <Text style={{ textAlign: 'center', color: colors.subtext, marginTop: 15, fontSize: 16 }}>
                No attendance records yet
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.recordCard, { backgroundColor: colors.card }]}>
              <View style={styles.dateContainer}>
                <MaterialIcons name="event" size={20} color={colors.subtext} style={styles.icon} />
                <Text style={[styles.dateText, { color: colors.text }]}>{item.date}</Text>
              </View>
              <View style={styles.statusContainer}>
                {item.status === 'Present' ? (
                  <MaterialIcons name="check-circle" size={24} color={colors.badgeGreen} />
                ) : (
                  <MaterialIcons name="cancel" size={24} color={colors.badgeRed} />
                )}
                <Text style={[styles.statusText, { color: item.status === 'Present' ? colors.badgeGreen : colors.badgeRed }]}>
                  {item.status}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    padding: 20,
    borderBottomWidth: 1,
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  subjectName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 15,
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
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    padding: 15,
  },
  recordCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});
