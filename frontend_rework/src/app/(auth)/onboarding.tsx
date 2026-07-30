import React, { useState, useRef } from 'react';
import { View, Text, Pressable, Dimensions, ScrollView, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth.store';
import { COLORS } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Stitch Onboarding data — images are the exact CDN URLs from Stitch.
 * Colors for the glow blob behind each slide's image are from the design:
 * - Page 1: primary-container/10 (blue glow)
 * - Page 2: secondary-container/20 (green glow)
 * - Page 3: tertiary-fixed/30 (orange glow)
 */
const SLIDES = [
  {
    id: 1,
    title: 'Report Civic Problems',
    body: 'Spotted a pothole or a broken light? Snap a photo and let your city council know in seconds.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqo0kgi7HV8dxB1wctpTQKEUUY_SyQxR7eNwN4JpxTGOZjXcRTnAwIUeFK2UhuSlh-JVjX59Os518sh1SbgCioBmSMUItBVG4rb_cRQdn-qL6631m4Sf97RIm-9Fdann8ttEQVbODwhXNbwdA5KtO-9uis9h4fXjskbon_0dkxf78pPxugC_gf-hA7DNQt4cGXlY3YiohYqoDx0WHVyZolNYm2K1IlP3dHGrk_f-YnwMy-ECTM4oo7',
    glowColor: 'rgba(37, 99, 235, 0.1)',
  },
  {
    id: 2,
    title: 'AI Powered Verification',
    body: 'Our smart system automatically categorizes and validates every report to ensure rapid response times.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARRWkUIselBNustPCt6vXc03kMWIjFwXzHhU-IuHaEGAwACuW5s2PacurIMxOKxH3GRPvk-4GAwosIBnmlbaF6lXhYoqPxSEa7WkeKSbgL6ggMhDOfjeDtSbnejwhEQ6m26n2JqvDNq8cGysJNtn7nRLZgzjDAoAIwK95yw0YrqFpGMGvrH1DM__3C30osKYfCfkagrzicKE9sgRLTiXphK3mOkxigpPY1HezbKeiIxG6K-enr0i6I',
    glowColor: 'rgba(107, 255, 143, 0.2)',
  },
  {
    id: 3,
    title: 'Track Every Update',
    body: 'Stay informed with real-time notifications as your report moves from submission to final resolution.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCl9UG43ogNNdF0dcqHNfwB81Gti-T7vg_eW8Vik0bDDJZaF_tfNYQqwY6-05CdO1gr-xIhVV-wrv_g38G3DXI4WlBmpiOA0ThjLpCwnbYJ5ChhjHoal1zIE0i7hRSMRFkdCAZe9EVOyaRnTMkYoFQXiYcLo6LMvUMbEdn8_MohRC667jbmEvyKe9AyemEHUUrNh8Ep_HfRcUPNVC2BIyzh-NP-a0Y0SL21KWKLwugp_ne-pAK3UVP',
    glowColor: 'rgba(255, 221, 184, 0.3)',
  },
];

/**
 * Stitch Onboarding Screen Design:
 * - Header: h-16, px-margin-mobile, "SmartCivic" headline-lg-mobile bold primary, "Skip" label-lg uppercase
 * - Slides: aspect-square container with glow blob, w-64 h-64 image
 * - Title: headline-lg-mobile, text-on-surface, mb-md
 * - Body: body-lg, text-on-surface-variant
 * - Footer: h-32, step dots (h-2, rounded-full, active w-24 bg-primary, inactive w-8 bg-outline-variant)
 * - CTA: w-full max-w-xs h-14 bg-primary rounded-xl, title-lg text, with arrow_forward/rocket_launch icon
 */
export default function OnboardingScreen() {
  const router = useRouter();
  const { setOnboarded } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleNext = () => {
    if (currentStep < SLIDES.length - 1) {
      const nextStep = currentStep + 1;
      scrollRef.current?.scrollTo({ x: SCREEN_WIDTH * nextStep, animated: true });
      setCurrentStep(nextStep);
    } else {
      setOnboarded(true);
      router.replace('/(tabs)');
    }
  };

  const handleSkip = () => {
    setOnboarded(true);
    router.replace('/(tabs)');
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentStep(page);
  };

  const isLast = currentStep === SLIDES.length - 1;

  return (
    <View className="flex-1 bg-surface">
      {/* Header (Stitch: h-16, px-margin-mobile, SmartCivic + Skip) */}
      <View className="h-16 flex-row items-center justify-between px-4">
        <Text className="text-headline-lg-mobile font-bold text-primary">SmartCivic</Text>
        {!isLast && (
          <Pressable onPress={handleSkip} className="active:opacity-70">
            <Text className="text-label-lg text-on-surface-variant uppercase tracking-widest">Skip</Text>
          </Pressable>
        )}
      </View>

      {/* Slide area (Stitch: flex-1, centered) */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        className="flex-1"
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} className="items-center justify-center px-4" style={{ width: SCREEN_WIDTH }}>
            {/* Image container (Stitch: relative w-full aspect-square mb-xl) */}
            <View className="w-72 h-72 rounded-full items-center justify-center mb-8 relative">
              {/* Glow blob (Stitch: absolute inset-0 rounded-full scale-90 blur-3xl) */}
              <View
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: slide.glowColor, transform: [{ scale: 0.9 }] }}
              />
              {/* Slide image (Stitch: w-64 h-64 object-contain) */}
              <Image
                source={slide.imageUrl}
                className="w-64 h-64"
                contentFit="contain"
                transition={200}
              />
            </View>
            {/* Title (Stitch: headline-lg-mobile, text-on-surface, mb-md) */}
            <Text className="text-headline-lg-mobile font-semibold text-on-surface text-center mb-4">
              {slide.title}
            </Text>
            {/* Body (Stitch: body-lg, text-on-surface-variant) */}
            <Text className="text-body-lg text-on-surface-variant text-center">
              {slide.body}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Footer (Stitch: h-32, flex-col items-center justify-between, px-margin-mobile pb-xl) */}
      <View className="items-center pb-8 px-4 gap-6" style={{ height: 128 }}>
        {/* Step dots (Stitch: gap-sm, h-2, active w-24 bg-primary, inactive w-8 bg-outline-variant) */}
        <View className="flex-row gap-2">
          {SLIDES.map((_, i) => (
            <View
              key={i}
              className="h-2 rounded-full"
              style={{
                width: i === currentStep ? 24 : 8,
                backgroundColor: i === currentStep ? COLORS.primary : COLORS.outlineVariant,
                // Stitch: transition width 0.3s ease, bg 0.3s ease
              }}
            />
          ))}
        </View>

        {/* CTA Button (Stitch: w-full max-w-xs h-14 bg-primary rounded-xl, title-lg) */}
        <Pressable
          onPress={handleNext}
          className="w-full h-14 bg-primary rounded-xl items-center justify-center flex-row gap-2 shadow-md active:scale-95"
          style={{ maxWidth: 320 }}
        >
          <Text className="text-title-lg font-medium text-on-primary">
            {isLast ? 'Get Started' : 'Next'}
          </Text>
          <MaterialIcons
            name={isLast ? 'rocket-launch' : 'arrow-forward'}
            size={20}
            color={COLORS.onPrimary}
          />
        </Pressable>
      </View>
    </View>
  );
}
