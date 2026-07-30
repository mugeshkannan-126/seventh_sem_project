import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { TopAppBar } from '@/components/ui';
import type { ComplaintStatus } from '@/types';

const FILTER_CHIPS = ['All Issues', 'Roads', 'Water', 'Lighting', 'Waste'] as const;
type FilterChip = typeof FILTER_CHIPS[number];

interface MockSelectedIssue {
  title: string;
  category: string;
  status: ComplaintStatus;
  distance: string;
}

export default function MapScreenWeb() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterChip>('All Issues');
  const [selectedIssue, setSelectedIssue] = useState<MockSelectedIssue | null>(null);

  const closeBottomSheet = () => {
    setSelectedIssue(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Top AppBar */}
      <TopAppBar title="SmartCivic" showAvatar showNotification />

      {/* Main Content Area */}
      <View style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        
        {/* Real Live Interactive Map (No overlays blocking mouse input) */}
        <iframe
          src="https://maps.google.com/maps?q=41.8781,-87.6298&z=14&output=embed"
          style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
          allowFullScreen
          loading="lazy"
        />

        {/* Interactive Issue Pins positioned relative to the map canvas */}
        {/* Water Issue - Critical */}
        {(activeFilter === 'All Issues' || activeFilter === 'Water') && (
          <Pressable
            onPress={() => {
              setSelectedIssue({
                title: 'Broken Water Main',
                category: 'WATER',
                status: 'critical',
                distance: '0.2 miles',
              });
            }}
            style={{ position: 'absolute', top: '30%', left: '40%', alignItems: 'center', zIndex: 10 }}
          >
            <MaterialIcons name="location-on" size={40} color={COLORS.error} />
            <View className="bg-white/95 px-2 py-0.5 rounded-lg border border-outline-variant shadow-sm -mt-1">
              <Text className="text-[10px] font-bold text-error">Water Issue</Text>
            </View>
          </Pressable>
        )}

        {/* Street Light - Pending */}
        {(activeFilter === 'All Issues' || activeFilter === 'Lighting') && (
          <Pressable
            onPress={() => {
              setSelectedIssue({
                title: 'Street Light Out',
                category: 'LIGHTING',
                status: 'pending',
                distance: '0.8 miles',
              });
            }}
            style={{ position: 'absolute', top: '55%', left: '55%', alignItems: 'center', zIndex: 10 }}
          >
            <MaterialIcons name="location-on" size={40} color={COLORS.tertiary} />
            <View className="bg-white/95 px-2 py-0.5 rounded-lg border border-outline-variant shadow-sm -mt-1">
              <Text className="text-[10px] font-bold text-tertiary">Light Out</Text>
            </View>
          </Pressable>
        )}

        {/* Pothole - Resolved */}
        {(activeFilter === 'All Issues' || activeFilter === 'Roads') && (
          <Pressable
            onPress={() => {
              setSelectedIssue({
                title: 'Pothole Fixed',
                category: 'ROADS',
                status: 'resolved',
                distance: '1.5 miles',
              });
            }}
            style={{ position: 'absolute', top: '40%', left: '22%', alignItems: 'center', zIndex: 10 }}
          >
            <MaterialIcons name="location-on" size={40} color={COLORS.secondary} />
            <View className="bg-white/95 px-2 py-0.5 rounded-lg border border-outline-variant shadow-sm -mt-1">
              <Text className="text-[10px] font-bold text-secondary">Resolved</Text>
            </View>
          </Pressable>
        )}

        {/* Waste - Critical */}
        {(activeFilter === 'All Issues' || activeFilter === 'Waste') && (
          <Pressable
            onPress={() => {
              setSelectedIssue({
                title: 'Illegal Dumping',
                category: 'WASTE',
                status: 'critical',
                distance: '0.5 miles',
              });
            }}
            style={{ position: 'absolute', top: '68%', left: '38%', alignItems: 'center', zIndex: 10 }}
          >
            <MaterialIcons name="location-on" size={40} color={COLORS.error} />
            <View className="bg-white/95 px-2 py-0.5 rounded-lg border border-outline-variant shadow-sm -mt-1">
              <Text className="text-[10px] font-bold text-error">Waste</Text>
            </View>
          </Pressable>
        )}

        {/* Floating Overlays - Search Bar & Chips */}
        <View style={{ position: 'absolute', top: 16, left: 0, right: 0, zIndex: 5 }} pointerEvents="box-none">
          <View style={{ gap: 16, paddingHorizontal: 16 }} pointerEvents="box-none">
            {/* Search Bar */}
            <View className="bg-surface/95 backdrop-blur-md shadow-lg rounded-full flex-row items-center px-4 h-12 border border-outline-variant max-w-xl mx-auto w-full">
              <MaterialIcons name="search" size={20} color={COLORS.onSurfaceVariant} />
              <TextInput
                className="flex-grow text-body-lg placeholder:text-on-surface-variant px-2"
                placeholder="Search civic issues or addresses..."
                placeholderTextColor={COLORS.onSurfaceVariant}
              />
              <MaterialIcons name="mic" size={20} color={COLORS.onSurfaceVariant} />
            </View>

            {/* Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2"
              className="mx-auto"
            >
              {FILTER_CHIPS.map((chip) => (
                <Pressable
                  key={chip}
                  onPress={() => setActiveFilter(chip)}
                  className={`flex-row items-center gap-1 px-4 py-2 rounded-full border ${
                    activeFilter === chip
                      ? 'bg-primary border-primary'
                      : 'bg-white/90 border-outline-variant shadow-sm'
                  }`}
                >
                  {chip === 'All Issues' && (
                    <MaterialIcons
                      name="tune"
                      size={16}
                      color={activeFilter === chip ? COLORS.onPrimary : COLORS.onSurfaceVariant}
                    />
                  )}
                  <Text
                    className={`text-label-lg font-semibold ${
                      activeFilter === chip ? 'text-on-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    {chip}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Zoom & Location Controls (Right Side) */}
        <View style={{ position: 'absolute', right: 16, top: '40%', zIndex: 5, gap: 8 }}>
          <Pressable className="w-12 h-12 bg-white shadow-lg rounded-xl items-center justify-center border border-outline-variant active:bg-surface-variant">
            <MaterialIcons name="add" size={24} color={COLORS.primary} />
          </Pressable>
          <Pressable className="w-12 h-12 bg-white shadow-lg rounded-xl items-center justify-center border border-outline-variant active:bg-surface-variant">
            <MaterialIcons name="remove" size={24} color={COLORS.primary} />
          </Pressable>
          <Pressable className="w-12 h-12 bg-white shadow-lg rounded-xl mt-4 items-center justify-center border border-outline-variant active:bg-surface-variant">
            <MaterialIcons name="my-location" size={24} color={COLORS.primary} />
          </Pressable>
        </View>

        {/* Bottom Sheet Details Overlay */}
        {selectedIssue && (
          <View 
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100 }}
            className="bg-surface rounded-t-[32px] shadow-overlay border-t border-outline-variant px-6 py-6 pb-24"
          >
            <View className="w-12 h-1.5 bg-outline-variant rounded-full mx-auto mb-6" />
            <View className="flex-row justify-between items-start mb-4">
              <View>
                <Text className="text-label-lg text-primary uppercase tracking-wider mb-1">
                  {selectedIssue.category}
                </Text>
                <Text className="text-headline-lg-mobile font-bold text-on-surface">
                  {selectedIssue.title}
                </Text>
              </View>
              <View 
                className={`px-3 py-1 rounded-full ${
                  selectedIssue.status === 'critical'
                    ? 'bg-error-container text-on-error-container'
                    : selectedIssue.status === 'resolved'
                    ? 'bg-secondary-container text-on-secondary-container'
                    : 'bg-tertiary-container text-on-tertiary-container'
                }`}
              >
                <Text className="text-label-lg font-bold">
                  {selectedIssue.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-4 mb-6">
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="navigation" size={16} color={COLORS.onSurfaceVariant} style={{ transform: [{ rotate: '45deg' }] }} />
                <Text className="text-body-md text-on-surface-variant">{selectedIssue.distance} away</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="schedule" size={16} color={COLORS.onSurfaceVariant} />
                <Text className="text-body-md text-on-surface-variant">Reported 2h ago</Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <Pressable 
                onPress={() => {
                  closeBottomSheet();
                  router.push('/complaint/c001');
                }}
                className="flex-1 bg-primary h-12 rounded-xl flex-row items-center justify-center gap-2 active:scale-95 shadow"
              >
                <MaterialIcons name="visibility" size={20} color={COLORS.onPrimary} />
                <Text className="text-on-primary font-bold text-body-lg">View Details</Text>
              </Pressable>
              <Pressable 
                onPress={closeBottomSheet}
                className="flex-1 bg-surface-variant h-12 rounded-xl flex-row items-center justify-center gap-2 active:scale-95"
              >
                <MaterialIcons name="directions" size={20} color={COLORS.onSurfaceVariant} />
                <Text className="text-on-surface-variant font-bold text-body-lg">Navigate</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
