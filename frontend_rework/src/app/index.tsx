import { Redirect } from 'expo-router';

/** Root index — redirect to splash screen */
export default function RootIndex() {
  return <Redirect href="/(auth)/splash" />;
}
