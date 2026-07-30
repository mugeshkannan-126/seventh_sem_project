import React, { useState } from 'react';
import { View } from 'react-native';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { BottomNavBar, type TabName } from '@/components/ui/BottomNavBar';

/**
 * Tab layout uses a custom floating BottomNavBar instead of the default Expo tab bar.
 * The Tabs component handles routing; we suppress its built-in tabBar.
 */
export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const getActiveTab = (): TabName => {
    if (pathname.includes('map')) return 'map';
    if (pathname.includes('feed')) return 'feed';
    if (pathname.includes('profile')) return 'profile';
    return 'home';
  };

  const handleTabPress = (tab: TabName) => {
    if (tab === getActiveTab()) return;
    if (tab === 'report') {
      router.push('/(report)/step1');
      return;
    }
    const routes: Record<TabName, string> = {
      home: '/(tabs)',
      map: '/(tabs)/map',
      report: '/(report)/step1',
      feed: '/(tabs)/feed',
      profile: '/(tabs)/profile',
    };
    router.push(routes[tab] as any);
  };

  return (
    <View className="flex-1">
      <Tabs
        screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}
      />
      <BottomNavBar activeTab={getActiveTab()} onTabPress={handleTabPress} />
    </View>
  );
}
