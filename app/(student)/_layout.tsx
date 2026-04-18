import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { useNotificationStore } from '../../store/notificationStore';

export default function StudentLayout() {
  const { colors, isDarkMode, toggleTheme } = useThemeStore();
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  return (
    <Tabs 
      screenOptions={{ 
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#FFF',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarActiveTintColor: colors.primary,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        headerRight: () => (
          <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 15 }}>
            <Ionicons name={isDarkMode ? 'sunny-outline' : 'moon-outline'} size={24} color="#FFF" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="subject"
        options={{
          href: null,
          title: 'Subject Details',
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color }) => <Ionicons name="notifications" size={24} color={color} />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
    </Tabs>
  );
}
