import React from 'react';
import { View, Text, ScrollView, Pressable, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { TopAppBar } from '@/components/ui';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Top App Bar */}
      <TopAppBar title="SmartCivic" showAvatar showNotification />

      <ScrollView 
        className="flex-1" 
        contentContainerClassName="px-4 py-6 pb-32" 
        showsVerticalScrollIndicator={false}
      >
        {/* User Header Profile */}
        <View className="flex-col items-center text-center mb-8">
          <View className="relative mb-4">
            <View 
              className="w-32 h-32 rounded-full p-1"
              style={{
                backgroundColor: COLORS.primary,
                // Gradient effect matching Stitch's bg-gradient-to-tr from-primary to-secondary-container
              }}
            >
              <Image 
                source="https://lh3.googleusercontent.com/aida-public/AB6AXuBN9ilM8K4gqkOaFEFaJkmOACuubjbTxFZQESRfkrWvYSOLQgu94HMAxk3pWptTWfRqtXLIuSXTmuZQMLtgiRKSUypajr4D5TKbH2o2V1xOH-5GBfP1Wi-sUdgoesugcE1ZCsQObbw6CengvOvEiJCIpPMEQNQzWPZbrmHVvRYvlXfzbzQ6ezCKBnILO1ngUZ7xJDg3vXFjZQgMfoaYeGPwgO8SyTeV4ySfEZOaI4eT9BGquoFENl9Y" 
                className="w-full h-full rounded-full border-4 border-surface shadow-lg"
                contentFit="cover"
              />
            </View>
            <View className="absolute bottom-1 right-1 bg-secondary rounded-full p-1.5 border-2 border-surface flex items-center justify-center">
              <MaterialIcons name="verified" size={16} color={COLORS.onSecondary} />
            </View>
          </View>
          <Text className="text-headline-lg-mobile font-semibold text-on-surface">Alex Smith</Text>
          <View className="flex-row items-center justify-center gap-1 mt-1">
            <MaterialIcons name="location-on" size={18} color={COLORS.onSurfaceVariant} />
            <Text className="text-body-md text-on-surface-variant font-medium">Oakwood District, Central City</Text>
          </View>
        </View>

        {/* Statistics Bento Grid */}
        <View className="flex-row gap-4 mb-8">
          <View className="flex-1 bg-surface-container-lowest border border-outline-variant p-4 flex-col items-center justify-center shadow-sm" style={{ borderRadius: 24 }}>
            <Text className="text-primary font-bold text-3xl leading-tight">12</Text>
            <Text className="text-on-surface-variant font-semibold text-[10px] uppercase tracking-wider mt-1">Reported</Text>
          </View>
          <View className="flex-1 bg-surface-container-lowest border border-outline-variant p-4 flex-col items-center justify-center shadow-sm" style={{ borderRadius: 24 }}>
            <Text className="text-secondary font-bold text-3xl leading-tight">8</Text>
            <Text className="text-on-surface-variant font-semibold text-[10px] uppercase tracking-wider mt-1">Resolved</Text>
          </View>
          <View className="flex-1 bg-surface-container-lowest border border-outline-variant p-4 flex-col items-center justify-center shadow-sm" style={{ borderRadius: 24 }}>
            <Text className="text-tertiary font-bold text-3xl leading-tight">4</Text>
            <Text className="text-on-surface-variant font-semibold text-[10px] uppercase tracking-wider mt-1">In Progress</Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View className="mb-8">
          <View className="flex-row justify-between items-end mb-4">
            <Text className="text-title-lg font-bold text-on-surface">Achievements</Text>
            <Pressable>
              <Text className="text-primary font-bold text-label-lg">View All</Text>
            </Pressable>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-4"
          >
            {/* Achievement 1 */}
            <View className="w-36 bg-surface-container-low border border-outline-variant p-4 flex-col items-center text-center" style={{ borderRadius: 24 }}>
              <View className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center mb-2 shadow-inner">
                <MaterialIcons name="workspace-premium" size={32} color={COLORS.onSecondaryContainer} />
              </View>
              <Text className="text-label-lg font-bold text-on-surface text-center leading-tight">Community Hero</Text>
              <Text className="text-[10px] text-on-surface-variant mt-1 text-center">10 Successful Reports</Text>
            </View>
            
            {/* Achievement 2 */}
            <View className="w-36 bg-surface-container-low border border-outline-variant p-4 flex-col items-center text-center" style={{ borderRadius: 24 }}>
              <View className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mb-2 shadow-inner">
                <MaterialIcons name="visibility" size={32} color={COLORS.onPrimaryContainer} />
              </View>
              <Text className="text-label-lg font-bold text-on-surface text-center leading-tight">Eagle Eye</Text>
              <Text className="text-[10px] text-on-surface-variant mt-1 text-center">First Spotter Rank</Text>
            </View>

            {/* Locked Badge */}
            <View className="w-36 bg-surface-variant/30 border border-dashed border-outline p-4 flex-col items-center text-center opacity-60" style={{ borderRadius: 24 }}>
              <View className="w-16 h-16 bg-surface-dim rounded-full flex items-center justify-center mb-2">
                <MaterialIcons name="lock" size={32} color={COLORS.outline} />
              </View>
              <Text className="text-label-lg font-bold text-on-surface-variant text-center leading-tight">City Guardian</Text>
              <Text className="text-[10px] text-on-surface-variant mt-1 text-center">Locked</Text>
            </View>
          </ScrollView>
        </View>

        {/* Recent Activity List */}
        <View className="mb-8">
          <Text className="text-title-lg font-bold text-on-surface mb-4">Recent Activity</Text>
          <View className="gap-3">
            {/* Activity Item 1 */}
            <Pressable
              onPress={() => router.push('/complaint/resolved-c002')}
              className="flex-row items-center gap-4 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant active:scale-[0.98]"
            >
              <View className="w-12 h-12 rounded-lg overflow-hidden bg-surface-variant flex-shrink-0">
                <Image 
                  source="https://lh3.googleusercontent.com/aida-public/AB6AXuDn8DeC7cXEgrjm-JO2ckrSjqw_P94HCVUJpgBnZ-fdKHY2jLMe0LFP3FvmD6ciwgWaAVb1E8_6dnHdUq4cDy1t5s_18FUvxkr8_cXxe0ugUbRV-ZbwJ8Felu9YTe6EmTB90u1xJVLBnGsLCaL-bZpOBk9rxcMO-trZkJ_rO6O5XDe19aQQtgB2A_dhNGymCY7GgEc_sH7IshgFr9qEA-0HPC3CX6deACnEXXKgLHMA41qJEFiM7NY9" 
                  className="w-full h-full"
                  contentFit="cover"
                />
              </View>
              <View className="flex-1">
                <Text className="text-body-lg font-semibold text-on-surface">Pothole Repaired</Text>
                <Text className="text-on-surface-variant text-body-md">24 Main St • Yesterday</Text>
              </View>
              <View className="bg-secondary/10 px-2 py-1 rounded-full">
                <Text className="text-[10px] font-bold text-secondary uppercase">Resolved</Text>
              </View>
            </Pressable>

            {/* Activity Item 2 */}
            <Pressable
              onPress={() => router.push('/complaint/c001')}
              className="flex-row items-center gap-4 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant active:scale-[0.98]"
            >
              <View className="w-12 h-12 rounded-lg overflow-hidden bg-surface-variant flex-shrink-0">
                <Image 
                  source="https://lh3.googleusercontent.com/aida-public/AB6AXuD2b9wvW1Qkiz4aXUxQNgJUyZQ4sARunIqYjhtVO-Ypg2ZEg0ZlWc7B27giQjiyj_k2sIi7_Dlwxp41rQnff8XuBJiZvxM7481PHd6YrmLGWPT83v5dn4skmOjzRjrOTJeTTNhe2_IMWKXwdgJSq48gnsPS4sNdvvf3XeWzCn3cY75FisQ7YhOvP2KKxrlshzLb9iqjd6M7r_9UfTqPes4NwQdDFuunEIluxLm3DclevJLN_IcuVvmF" 
                  className="w-full h-full"
                  contentFit="cover"
                />
              </View>
              <View className="flex-1">
                <Text className="text-body-lg font-semibold text-on-surface">Street Light Out</Text>
                <Text className="text-on-surface-variant text-body-md">Oak Ave • 3 days ago</Text>
              </View>
              <View className="bg-tertiary/10 px-2 py-1 rounded-full">
                <Text className="text-[10px] font-bold text-tertiary uppercase">In Progress</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Preferences */}
        <View className="mb-8">
          <Text className="text-title-lg font-bold text-on-surface mb-4">Preferences</Text>
          <View className="bg-surface-container-lowest rounded-card border border-outline-variant overflow-hidden">
            {/* Notification setting */}
            <Pressable className="w-full flex-row items-center justify-between p-4 active:bg-surface-container border-b border-outline-variant">
              <View className="flex-row items-center gap-3">
                <MaterialIcons name="notifications" size={24} color={COLORS.primary} />
                <Text className="text-body-lg text-on-surface font-medium">Notifications</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={COLORS.onSurfaceVariant} />
            </Pressable>
            {/* Dark mode setting */}
            <Pressable className="w-full flex-row items-center justify-between p-4 active:bg-surface-container border-b border-outline-variant">
              <View className="flex-row items-center gap-3">
                <MaterialIcons name="dark-mode" size={24} color={COLORS.primary} />
                <Text className="text-body-lg text-on-surface font-medium">App Theme</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Text className="text-on-surface-variant font-semibold text-label-lg">Light</Text>
                <MaterialIcons name="chevron-right" size={24} color={COLORS.onSurfaceVariant} />
              </View>
            </Pressable>
            {/* Help setting */}
            <Pressable className="w-full flex-row items-center justify-between p-4 active:bg-surface-container">
              <View className="flex-row items-center gap-3">
                <MaterialIcons name="help" size={24} color={COLORS.primary} />
                <Text className="text-body-lg text-on-surface font-medium">Help &amp; Support</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={COLORS.onSurfaceVariant} />
            </Pressable>
          </View>
        </View>

        {/* Sign Out */}
        <Pressable 
          onPress={() => router.replace('/(auth)/signin' as any)}
          className="w-full py-4 items-center justify-center border border-error/20 rounded-xl active:bg-error/5"
        >
          <Text className="text-error font-bold text-body-lg">Sign Out</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}
