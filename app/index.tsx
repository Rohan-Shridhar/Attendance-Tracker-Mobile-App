import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function IndexScreen() {
  const { isLoggedIn, user } = useAuthStore();

  if (!isLoggedIn) {
    return <Redirect href="/landing" />;
  }

  if (user?.role === 'teacher') {
    return <Redirect href="/(teacher)/profile" />;
  }

  return <Redirect href="/(student)/profile" />;
}
