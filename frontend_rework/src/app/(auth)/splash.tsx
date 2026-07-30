import React, { useEffect } from 'react';
import { View, Text, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';

/**
 * Stitch Splash Screen Design:
 * - Full screen bg-surface (#f8f9ff)
 * - Two atmospheric blur blobs: top-right primary-fixed-dim, bottom-left secondary-fixed-dim (opacity 10%)
 * - Logo: w-24 h-24, bg-primary (#004ac6), rounded-[28px], rotated -5deg, shadow-lg
 *   - Icon: location_city filled, 48px, text-on-primary (#fff)
 *   - Animated ring: 120px, 2px border primary, 32% border-radius, pulse animation
 * - Branding: "SmartCivic" headline-lg-mobile (#004ac6), "Report. Track. Improve." body-lg text-on-surface-variant
 * - Footer: loading bar (140px x 4px, bg-surface-container, progress-bar primary), tagline label-lg
 * - Navigate to onboarding after 3.5s
 */
export default function SplashScreen() {
  const router = useRouter();

  // Animation values
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const logoTranslateY = useSharedValue(20);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const footerOpacity = useSharedValue(0);
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.1);
  const progressX = useSharedValue(-30);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }, { translateY: logoTranslateY.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const footerStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progressX.value }],
  }));

  useEffect(() => {
    // Logo entrance (slide-up animation from Stitch: 0.8s cubic-bezier(0.22, 1, 0.36, 1))
    logoOpacity.value = withTiming(1, { duration: 800 });
    logoScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    logoTranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) });

    // Ring pulse (3s infinite ease-in-out from Stitch)
    ringScale.value = withDelay(
      400,
      withRepeat(withSequence(withTiming(1.1, { duration: 1500 }), withTiming(1, { duration: 1500 })), -1, true),
    );
    ringOpacity.value = withDelay(
      400,
      withRepeat(withSequence(withTiming(0.2, { duration: 1500 }), withTiming(0.1, { duration: 1500 })), -1, true),
    );

    // Text entrance (delay 0.3s from Stitch)
    textOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));
    textTranslateY.value = withDelay(300, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));

    // Footer + progress bar (fade-in delay 0.6s from Stitch)
    footerOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
    progressX.value = withDelay(
      700,
      withRepeat(
        withSequence(withTiming(140, { duration: 1200 }), withTiming(-30, { duration: 0 })),
        -1,
        false,
      ),
    );

    // Navigate after 3.5s
    const timer = setTimeout(() => {
      router.replace('/(auth)/onboarding');
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-surface items-center justify-center overflow-hidden px-4">
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Atmospheric blobs (Stitch: absolute, rounded-full, opacity-10, blur-[120px]) */}
      <View
        className="absolute rounded-full opacity-10"
        style={{
          top: '-10%',
          right: '-10%',
          width: 400,
          height: 400,
          backgroundColor: COLORS.primaryFixedDim,
        }}
      />
      <View
        className="absolute rounded-full opacity-10"
        style={{
          bottom: '-10%',
          left: '-10%',
          width: 300,
          height: 300,
          backgroundColor: COLORS.secondaryFixedDim,
        }}
      />

      {/* Logo section (Stitch: logo-container mb-8 slide-up) */}
      <Animated.View style={logoStyle} className="mb-8 items-center justify-center">
        {/* Pulsing ring (Stitch: 120px, border 2px primary, border-radius 32%) */}
        <Animated.View
          style={[
            ringStyle,
            {
              position: 'absolute',
              width: 120,
              height: 120,
              borderRadius: 38, // ~32% of 120
              borderWidth: 2,
              borderColor: COLORS.primary,
            },
          ]}
        />
        {/* Logo icon (Stitch: w-24 h-24, bg-primary, rounded-[28px], rotate(-5deg), shadow-lg) */}
        <View
          className="w-24 h-24 bg-primary items-center justify-center shadow-lg"
          style={{ borderRadius: 28, transform: [{ rotate: '-5deg' }] }}
        >
          <MaterialIcons name="location-city" size={48} color={COLORS.onPrimary} />
        </View>
      </Animated.View>

      {/* Branding section (Stitch: text-center slide-up, delay 0.3s) */}
      <Animated.View style={textStyle} className="items-center">
        <Text className="text-headline-lg-mobile font-bold text-primary tracking-tight">
          SmartCivic
        </Text>
        <Text className="text-body-lg text-on-surface-variant opacity-80 mt-1 font-medium tracking-wide">
          Report. Track. Improve.
        </Text>
      </Animated.View>

      {/* Footer (Stitch: absolute bottom-xl, fade-in delay 0.6s) */}
      <Animated.View style={footerStyle} className="absolute bottom-8 items-center">
        {/* Loading bar (Stitch: 140px x 4px, bg-surface-container, rounded-full) */}
        <View
          className="overflow-hidden mb-4"
          style={{ width: 140, height: 4, borderRadius: 9999, backgroundColor: COLORS.surfaceContainer }}
        >
          <Animated.View
            style={[progressStyle, { width: '30%', height: '100%', borderRadius: 9999, backgroundColor: COLORS.primary }]}
          />
        </View>
        {/* Tagline (Stitch: label-lg, text-outline, opacity-60, uppercase, tracking-[0.2em]) */}
        <Text
          className="text-label-lg text-outline opacity-60 uppercase"
          style={{ letterSpacing: 3.2 }}
        >
          Local Governance Evolved
        </Text>
      </Animated.View>
    </View>
  );
}
