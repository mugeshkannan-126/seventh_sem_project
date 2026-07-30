import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useReportStore } from '@/store/report.store';
import { useCreateComplaint } from '@/hooks/useComplaints';
import { COLORS } from '@/constants/colors';
import { TopAppBar } from '@/components/ui';

export default function AIAnalysisScreen() {
  const router = useRouter();
  const { category, description, address, latitude, longitude, reset } = useReportStore();
  const createMutation = useCreateComplaint();
  const [submitting, setSubmitting] = useState(false);

  // Animation values
  const scanningY = useSharedValue(-10);
  const contentOpacity = useSharedValue(0);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  useEffect(() => {
    // Scanning animation
    scanningY.value = withDelay(
      500,
      withTiming(150, { duration: 1500, easing: Easing.inOut(Easing.ease) })
    );
    contentOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await createMutation.mutateAsync({
        title: 'Severe Pothole on Main St.',
        description: description || 'Severe road surface damage.',
        category: (category ?? 'pothole') as any,
        location: { latitude: latitude ?? 41.8781, longitude: longitude ?? -87.6298 },
        address: address || 'Oakwood District, Block 4',
        images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDIIhOzzjlZapEGHknN34JTY4IWm4nmQKAYcVkDLMjX9UBLSStEieXcHOfFwavM2qVlFBUJsEY_GBQPls0ACvpk_0K2SrClmZYHBpSkyrkLoi2rzrsrEY2Lp3_IYbX9ujSOlGwKDRV7grN9WX8gaZRuHv4jxaxNRvruF90rp__kzysJFLnK6ecSb32SBAsfeOy9pk8qlOhvWJHGz4hNKbcTeKUBXgSqK-OS0ZRgSTAcDMYGH4vD6kV0'],
      });
      reset();
      router.push('/(tabs)');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Top AppBar */}
      <TopAppBar title="SmartCivic" showAvatar showNotification />

      <ScrollView 
        className="flex-1 max-w-2xl mx-auto w-full px-4" 
        contentContainerClassName="py-6 pb-36 gap-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="mb-4">
          <View className="flex-row items-center gap-1.5 mb-2">
            <MaterialIcons name="auto-awesome" size={16} color={COLORS.primary} />
            <Text className="text-label-lg font-bold uppercase tracking-widest text-primary">
              Intelligence Processing
            </Text>
          </View>
          <Text className="text-headline-lg-mobile font-semibold text-on-surface">
            AI Analysis Report
          </Text>
          <Text className="text-body-lg text-on-surface-variant mt-2">
            Our neural engine has processed the visual evidence and sensor data.
          </Text>
        </View>

        {/* Scan Visualizer Card (Stitch: col-span-7) */}
        <View 
          className="relative bg-surface-container-lowest border border-outline-variant overflow-hidden flex items-center justify-center shadow-sm"
          style={{ borderRadius: 24, minHeight: 280 }}
        >
          {/* Background image container */}
          <Image 
            source="https://lh3.googleusercontent.com/aida-public/AB6AXuDIIhOzzjlZapEGHknN34JTY4IWm4nmQKAYcVkDLMjX9UBLSStEieXcHOfFwavM2qVlFBUJsEY_GBQPls0ACvpk_0K2SrClmZYHBpSkyrkLoi2rzrsrEY2Lp3_IYbX9ujSOlGwKDRV7grN9WX8gaZRuHv4jxaxNRvruF90rp__kzysJFLnK6ecSb32SBAsfeOy9pk8qlOhvWJHGz4hNKbcTeKUBXgSqK-OS0ZRgSTAcDMYGH4vD6kV0"
            className="w-full h-full absolute inset-0 opacity-80"
            contentFit="cover"
          />
          <View className="absolute inset-0 bg-primary/10" />

          {/* Analysis Circular Progress Overlay */}
          <View className="z-10 items-center justify-center bg-white/70 p-6 rounded-full w-40 h-40 border border-white/20 shadow-md">
            <Text className="text-headline-lg-mobile font-bold text-primary">98%</Text>
            <Text className="text-[10px] font-bold text-primary uppercase tracking-wider mt-0.5">Confidence</Text>
          </View>

          {/* Analyzing Pill Overlay */}
          <View className="absolute bottom-4 bg-primary-container px-4 py-1.5 rounded-full shadow z-10">
            <Text className="text-label-lg font-bold text-on-primary-container">
              Analyzing Artifacts...
            </Text>
          </View>
        </View>

        {/* Animated Details */}
        <Animated.View style={contentStyle} className="gap-6">
          {/* Attributes Card */}
          <View className="bg-surface-container-lowest p-6 border border-outline-variant" style={{ borderRadius: 24 }}>
            <View className="flex-row items-center gap-2 mb-4">
              <MaterialIcons name="data-object" size={24} color={COLORS.primary} />
              <Text className="text-title-lg font-bold text-on-surface">Detected Attributes</Text>
            </View>

            <View className="gap-3">
              {/* Category */}
              <View className="flex-row items-center justify-between p-3 rounded-xl bg-surface-container-low">
                <View className="flex-row items-center gap-3">
                  <MaterialIcons name="category" size={20} color={COLORS.onSurfaceVariant} />
                  <Text className="font-semibold text-body-md text-on-surface-variant">Category</Text>
                </View>
                <Text className="font-bold text-body-md text-primary">Pothole (98%)</Text>
              </View>

              {/* Severity */}
              <View className="flex-row items-center justify-between p-3 rounded-xl bg-surface-container-low">
                <View className="flex-row items-center gap-3">
                  <MaterialIcons name="warning" size={20} color={COLORS.error} />
                  <Text className="font-semibold text-body-md text-on-surface-variant">Severity</Text>
                </View>
                <View className="bg-error-container px-3 py-0.5 rounded-full">
                  <Text className="text-label-lg font-bold text-on-error-container">High</Text>
                </View>
              </View>

              {/* Resolution */}
              <View className="flex-row items-center justify-between p-3 rounded-xl bg-surface-container-low">
                <View className="flex-row items-center gap-3">
                  <MaterialIcons name="schedule" size={20} color={COLORS.onSurfaceVariant} />
                  <Text className="font-semibold text-body-md text-on-surface-variant">Est. Resolution</Text>
                </View>
                <Text className="font-bold text-body-md text-on-surface">3 days</Text>
              </View>
            </View>
          </View>

          {/* Department Card */}
          <View 
            className="bg-surface-container-low p-6 border border-primary/20 flex-row items-center gap-4 shadow-sm"
            style={{ borderRadius: 24 }}
          >
            <View className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow">
              <MaterialIcons name="engineering" size={24} color="#ffffff" />
            </View>
            <View>
              <Text className="text-label-lg font-bold text-on-surface-variant uppercase tracking-wider">Assigned To</Text>
              <Text className="text-title-lg font-bold text-on-surface">Public Works</Text>
            </View>
          </View>

          {/* Action Footer */}
          <View className="bg-primary-container p-6 rounded-3xl text-on-primary-container flex-col gap-4 shadow">
            <View className="flex-row items-start gap-3">
              <MaterialIcons name="info" size={28} color={COLORS.onPrimaryContainer} style={{ opacity: 0.8 }} />
              <View className="flex-1">
                <Text className="text-body-lg font-bold text-on-primary-container">Verify AI Predictions</Text>
                <Text className="text-body-md text-on-primary-container/90 mt-1">
                  Confirming will dispatch a repair crew to the GPS coordinates embedded in the image.
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              className="w-full h-14 bg-primary rounded-2xl items-center justify-center flex-row gap-2 active:scale-95 shadow-lg"
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text className="text-title-lg font-bold text-white">Proceed</Text>
                  <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
                </>
              )}
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
