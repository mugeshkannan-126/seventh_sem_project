import { Redirect } from 'expo-router';

/** Explore route — redirect to feed tab */
export default function ExploreRedirect() {
  return <Redirect href="/(tabs)/feed" />;
}
