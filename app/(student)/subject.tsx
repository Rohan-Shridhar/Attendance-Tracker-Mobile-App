import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';

// Mock data generator
const generateMockRecords = () => {
  const records = [];
  const dates = [
    'Mon, 10 Mar 2025', 'Fri, 07 Mar 2025', 'Wed, 05 Mar 2025',
    'Mon, 03 Mar 2025', 'Fri, 28 Feb 2025', 'Wed, 26 Feb 2025',
    'Mon, 24 Feb 2025', 'Fri, 21 Feb 2025', 'Wed, 19 Feb 2025',
    'Mon, 17 Feb 2025'
  ];
  
  // Mixed present/absent
  const statuses = [true, true, false, true, true, false, true, true, true, false];
  
  for (let i = 0; i < 10; i++) {
    records.push({
      id: i.toString(),
      date: dates[i],
      isPresent: statuses[i]
    });
  }
  return records;
};

export default function SubjectDetailScreen() {
  const { name, percentage } = useLocalSearchParams<{ name: string; percentage: string }>();
  const records = React.useMemo(() => generateMockRecords(), []);
  const { colors } = useThemeStore();
  
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
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.recordCard, { backgroundColor: colors.card }]}>
            <View style={styles.dateContainer}>
              <MaterialIcons name="event" size={20} color={colors.subtext} style={styles.icon} />
              <Text style={[styles.dateText, { color: colors.text }]}>{item.date}</Text>
            </View>
            <View style={styles.statusContainer}>
              {item.isPresent ? (
                <MaterialIcons name="check-circle" size={24} color={colors.badgeGreen} />
              ) : (
                <MaterialIcons name="cancel" size={24} color={colors.badgeRed} />
              )}
              <Text style={[styles.statusText, { color: item.isPresent ? colors.badgeGreen : colors.badgeRed }]}>
                {item.isPresent ? 'Present' : 'Absent'}
              </Text>
            </View>
          </View>
        )}
      />
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
