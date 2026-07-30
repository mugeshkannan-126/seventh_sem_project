import React from 'react';
import { View, Text, ScrollView, Pressable, StatusBar, Linking } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { TopAppBar } from '@/components/ui';

export default function ResolvedComplaintDetailScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Top AppBar */}
      <TopAppBar title="SmartCivic" showAvatar showNotification />

      <ScrollView 
        className="flex-1" 
        contentContainerClassName="px-4 py-6 pb-32" 
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center gap-2 py-2 mb-4 active:opacity-70"
        >
          <MaterialIcons name="arrow-back" size={20} color={COLORS.onSurfaceVariant} />
          <Text className="text-label-lg font-bold text-on-surface-variant">Back</Text>
        </Pressable>

        {/* Hero Complaint Header */}
        <View className="mb-6 gap-4">
          <View className="flex-row justify-between items-start">
            <View>
              <Text className="text-label-lg text-on-surface-variant uppercase tracking-wider">Complaint ID</Text>
              <Text className="text-headline-lg-mobile font-bold text-on-surface">#SC-9821</Text>
            </View>
            {/* Priority Chip */}
            <View className="px-3 py-1 rounded-full bg-tertiary-fixed flex-row items-center gap-1 shadow-sm">
              <MaterialIcons name="priority-high" size={16} color={COLORS.onTertiaryFixed} />
              <Text className="text-label-lg font-bold text-on-tertiary-fixed uppercase">Medium Priority</Text>
            </View>
          </View>

          {/* Reported Photo */}
          <View>
            <View className="relative w-full h-64 rounded-card overflow-hidden shadow-md">
              <Image 
                source="https://lh3.googleusercontent.com/aida-public/AB6AXuDG1CHkIgFdknnhSrpZEJme8tSefdof6iZaZTGjwy_cInKWKySemt3Y7Ge9TO1tEMLJs4L2NB0U2PBiQiOluih5wAbZ7G_fT5IkLnp3rA-KeApD7O4yPpTcH3pT_n9rjBFORBAs1Frx0kTz0nrruwmf8GEhbD9a1kS8aOFGgowu6rgpr3vXpoKWMeAdZfm47jkumS5NhYz2LDS2T9vd-Rz2v4gPflhq38NGUCO4c_PNUwpWRXWRIs6D" 
                className="w-full h-full"
                contentFit="cover"
              />
              {/* Address Overlay */}
              <View 
                className="absolute bottom-4 right-4 rounded-xl px-3 py-2 flex-row items-center gap-2 border"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderColor: 'rgba(255, 255, 255, 0.4)' }}
              >
                <MaterialIcons name="location-on" size={18} color={COLORS.primary} />
                <Text className="text-on-surface font-semibold text-body-md">Oakwood Ave, Sector 4</Text>
              </View>
            </View>
          </View>

          {/* Resolution Photo */}
          <View>
            <View className="flex-row items-center gap-2 mb-3">
              <MaterialIcons name="task-alt" size={24} color={COLORS.secondary} />
              <Text className="text-title-lg font-bold text-on-surface">Resolution Photo</Text>
            </View>
            <View className="relative w-full h-64 rounded-card overflow-hidden shadow-md border-4 border-secondary/20">
              <Image 
                source="https://lh3.googleusercontent.com/aida-public/AB6AXuC7ZF2-mQabM4HX0VlIm4PzUkoGEg0dwEkhVngSYF2DM4oaiqz8EEsUYAQtTs-7g27mdqwgklKvUEBQxzGto7MD1R7-pafMd83zpSQ5LnPvgvInE6SvUXTaqMVCad8JU0_UVWewbSpYjmmbIpL1xD48AvobhLcH0yLKApJJHf6ySIRXh8wucCJBrEum8V9CB83PHBN2RMoHKzeK8Prp2lH5I7y5vxMIwe8pS2BJzTna89cyU3ES_0Jc" 
                className="w-full h-full"
                contentFit="cover"
              />
            </View>
          </View>
        </View>

        {/* Active Status Badge */}
        <View 
          className="bg-secondary-container p-4 rounded-card mb-6 flex-row items-center gap-4 border"
          style={{ borderColor: 'rgba(0, 110, 47, 0.2)' }}
        >
          <View className="bg-secondary p-3 rounded-xl shadow">
            <MaterialIcons name="check-circle" size={24} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-label-lg font-bold text-on-secondary-container opacity-80 uppercase tracking-wide">Current Status</Text>
            <Text className="text-body-lg font-bold text-on-secondary-container mt-0.5">Resolved</Text>
          </View>
        </View>

        {/* Vertical Timeline Section */}
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-6">
            <MaterialIcons name="timeline" size={24} color={COLORS.primary} />
            <Text className="text-title-lg font-bold text-on-surface">Status Timeline</Text>
          </View>

          <View className="ml-4 border-l-2 border-outline-variant pl-6 gap-y-6">
            {/* Step: Submitted */}
            <View className="relative pb-4">
              {/* Dot */}
              <View 
                className="absolute -left-[35px] top-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center border-4 border-surface"
              >
                <MaterialIcons name="check" size={16} color="#ffffff" />
              </View>
              <View>
                <Text className="text-body-lg font-bold text-on-surface">Submitted</Text>
                <Text className="text-body-md text-on-surface-variant">October 12, 2023 • 09:15 AM</Text>
                <Text className="mt-2 text-on-surface-variant text-body-md bg-surface-container p-3 rounded-xl border border-outline-variant/30">
                  Report filed via Mobile App: "Street light flickering and occasionally staying off near the park entrance."
                </Text>
              </View>
            </View>

            {/* Step: Verified */}
            <View className="relative pb-4">
              {/* Dot */}
              <View 
                className="absolute -left-[35px] top-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center border-4 border-surface"
              >
                <MaterialIcons name="check" size={16} color="#ffffff" />
              </View>
              <View>
                <Text className="text-body-lg font-bold text-on-surface">Verified</Text>
                <Text className="text-body-md text-on-surface-variant">October 12, 2023 • 11:40 AM</Text>
                <Text className="mt-2 text-on-surface-variant text-body-md italic">Complaint validated by regional supervisor.</Text>
              </View>
            </View>

            {/* Step: Assigned */}
            <View className="relative pb-4">
              {/* Dot */}
              <View 
                className="absolute -left-[35px] top-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center border-4 border-surface"
              >
                <MaterialIcons name="check" size={16} color="#ffffff" />
              </View>
              <View>
                <Text className="text-body-lg font-bold text-on-surface">Assigned</Text>
                <Text className="text-body-md text-on-surface-variant">October 13, 2023 • 08:30 AM</Text>
                
                <View className="mt-3 flex-row items-center gap-3 p-3 rounded-2xl bg-surface-container-high border border-outline-variant/30 shadow-sm">
                  <View className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center">
                    <Text className="text-on-primary-fixed font-bold text-label-lg">PW</Text>
                  </View>
                  <View>
                    <Text className="font-semibold text-body-md text-on-surface">Officer James Thompson</Text>
                    <Text className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Public Works Electrical Division</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Step: In Progress */}
            <View className="relative pb-4">
              {/* Dot */}
              <View 
                className="absolute -left-[35px] top-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center border-4 border-surface"
              >
                <MaterialIcons name="check" size={16} color="#ffffff" />
              </View>
              <View>
                <Text className="text-body-lg font-bold text-on-surface">In Progress</Text>
                <Text className="text-body-md text-on-surface-variant">October 14, 2023 • 10:00 AM</Text>
              </View>
            </View>

            {/* Step: Resolved */}
            <View className="relative">
              {/* Dot */}
              <View 
                className="absolute -left-[35px] top-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center border-4 border-surface"
              >
                <MaterialIcons name="check" size={16} color="#ffffff" />
              </View>
              <View>
                <Text className="text-body-lg font-bold text-on-surface">Resolved</Text>
                <Text className="text-body-md text-on-surface-variant">October 15, 2023 • 04:30 PM</Text>
                <Text className="mt-2 text-on-secondary-container text-body-md bg-secondary-container p-3 rounded-xl border border-secondary/20 font-medium">
                  The repair was completed on October 15. Thank you for helping us improve our city!
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-4 mt-6">
          <Pressable 
            className="flex-1 flex-row items-center justify-center gap-2 bg-primary py-4 rounded-2xl shadow-md active:scale-95"
          >
            <MaterialIcons name="star" size={20} color={COLORS.onPrimary} />
            <Text className="text-on-primary font-bold text-label-lg">Rate Service</Text>
          </Pressable>
          <Pressable 
            className="flex-1 flex-row items-center justify-center gap-2 bg-surface-container-highest py-4 rounded-2xl border active:scale-95"
            style={{ borderColor: 'rgba(0, 74, 198, 0.2)' }}
          >
            <MaterialIcons name="contact-phone" size={20} color={COLORS.primary} />
            <Text className="text-primary font-bold text-label-lg">Contact Officer</Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
