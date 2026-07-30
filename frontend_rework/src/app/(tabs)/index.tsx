import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StatusBar,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { TopAppBar, StatCard, SectionHeader, BentoCard, EmergencyContactCard, IssueCard } from '@/components/ui';
import { useComplaintStats, useComplaints } from '@/hooks/useComplaints';
import { MOCK_EMERGENCY_CONTACTS } from '@/constants/mockData';
import { COLORS } from '@/constants/colors';

/**
 * Stitch Home Dashboard Design:
 * - Top App Bar: h-16, avatar circle, "SmartCivic" headline-lg-mobile, location subtitle, notification bell
 * - Greeting: headline-lg "Hello, Alex", body-lg subtitle
 * - Quick Stats: 3-column grid, rounded-card, border, shadow-sm
 * - Bento Actions: 2 cards side by side — Report Issue (primary-container) + Track Complaint (secondary-container)
 *   - Each: p-6, rounded-card, min-h-[160px], 32px icon, bg icon 120px absolute
 * - Nearby Issues: map preview h-[220px] rounded-card, overlay glass card at bottom
 * - Emergency Contacts: surface-container-low p-4 rounded-xl, flex-row items-center
 * - Latest Updates: horizontal scroll, min-w-[280px], rounded-card, image h-40, status chip, card content
 * - Bottom Nav: floating pill (handled by layout)
 */
export default function HomeScreen() {
  const router = useRouter();
  const { data: stats } = useComplaintStats();
  const { data: complaintsPage } = useComplaints();

  const complaints = complaintsPage?.items ?? [];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Top App Bar (Stitch: h-16, px-margin-mobile, bg-surface) */}
      <TopAppBar title="SmartCivic" subtitle="Downtown, City" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
      >
        {/* Stitch: mt-20 px-margin-mobile max-w-[1280px] space-y-8 */}
        <View className="px-4 gap-y-8 mt-5">

          {/* Greeting (Stitch: headline-lg, body-lg) */}
          <View>
            <Text className="text-headline-lg font-semibold text-on-surface">Hello, Alex</Text>
            <Text className="text-body-lg text-on-surface-variant mt-1">
              Here is what's happening in your neighborhood today.
            </Text>
          </View>

          {/* Quick Stats (Stitch: grid grid-cols-3 gap-4) */}
          <View className="flex-row gap-4">
            <StatCard value={stats?.total ?? 12} label="Total" valueColor={COLORS.primary} />
            <StatCard value={stats?.resolved ?? 8} label="Resolved" valueColor={COLORS.onSecondaryContainer} />
            <StatCard value={stats?.pending ?? 4} label="Pending" valueColor={COLORS.tertiaryContainer} />
          </View>

          {/* Bento Actions (Stitch: side-by-side primary + secondary bento cards) */}
          <View className="flex-row gap-4">
            <BentoCard
              variant="primary"
              icon="add-circle"
              bgIcon="report-problem"
              title="Report Issue"
              description="Spotted a pothole or broken light?"
              onPress={() => router.push('/(report)/step1')}
            />
            <BentoCard
              variant="secondary"
              icon="track-changes"
              bgIcon="analytics"
              title="Track Complaint"
              description="Check status of your active tickets."
              onPress={() => router.push('/complaint/c001')}
            />
          </View>

          {/* Nearby Issues Map Preview */}
          <View>
            <SectionHeader title="Nearby Issues" actionLabel="See All" onAction={() => router.push('/(tabs)/map')} />
            {/* Stitch: h-[220px] rounded-card overflow-hidden border shadow-sm */}
            <Pressable
              onPress={() => router.push('/(tabs)/map')}
              className="overflow-hidden border border-outline-variant shadow-sm active:opacity-95"
              style={{ height: 220, borderRadius: 24 }}
            >
              <Image
                source="https://lh3.googleusercontent.com/aida-public/AB6AXuD5VGNjcAAfPHr-y15yH6kaOAIDnLonDXj8EOreXMdvZCsKkb85gRp2Inm0JWn7elUkkOYMvOyrTmOfbmUH-_1zcag8njyxGuWhBxXnbA0wM8m39MXnjMePYeQr_nDephfE00N_VrSgNl05bbTMn-_MZSxTnMkxaoUuadDGD6GTldsbTgA_OZrrWtXmxafo2SBLiUYge9MZJbncm6XXTj-mgD6J9Y5CxfvxJfts-f7jlXL5jKdkDqBS"
                className="w-full h-full"
                contentFit="cover"
              />
              {/* Glass overlay card (Stitch: absolute bottom-4 left-4 right-4 glass-card p-3 rounded-xl) */}
              <View
                className="absolute bottom-4 left-4 right-4 rounded-xl p-3 flex-row items-center gap-3"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
              >
                <View className="w-10 h-10 bg-error-container rounded-lg items-center justify-center">
                  <MaterialIcons name="water-drop" size={20} color={COLORS.onErrorContainer} />
                </View>
                <View>
                  <Text className="text-label-lg font-bold text-on-surface">Water Leakage</Text>
                  <Text className="text-on-surface-variant" style={{ fontSize: 11 }}>200m away • Reported 2h ago</Text>
                </View>
              </View>
            </Pressable>
          </View>

          {/* Emergency Contacts (Stitch: space-y-3) */}
          <View>
            <SectionHeader title="Emergency Contacts" />
            <View className="gap-3">
              {MOCK_EMERGENCY_CONTACTS.map((contact) => (
                <EmergencyContactCard
                  key={contact.id}
                  contact={contact}
                  onPress={(phone) => Linking.openURL(`tel:${phone}`)}
                />
              ))}
            </View>
          </View>

          {/* Latest Updates (Stitch: horizontal scroll, snap-x, gap-6, min-w-[280px]) */}
          <View>
            <SectionHeader title="Latest Updates" actionLabel="See All" onAction={() => router.push('/(tabs)/feed')} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-4 pb-2"
              className="-mx-4 px-4"
              snapToInterval={296}
              decelerationRate="fast"
            >
              {complaints.slice(0, 4).map((c) => (
                <IssueCard
                  key={c.id}
                  complaint={c}
                  width={280}
                  onPress={(id) => {
                    const target = c.status === 'resolved' ? `/complaint/resolved-${id}` : `/complaint/${id}`;
                    router.push(target as any);
                  }}
                />
              ))}
            </ScrollView>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
