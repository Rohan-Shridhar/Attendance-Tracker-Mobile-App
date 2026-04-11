import { Redirect } from 'expo-router';

export default function RedirectToProfile() {
  return <Redirect href="/(student)/profile" />;
}
