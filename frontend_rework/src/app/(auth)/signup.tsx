import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';

/**
 * Stitch Create Account Screen Design:
 * - Mobile layout: bg-surface, full-width form
 * - Mobile header: SmartCivic logo (w-8 h-8 bg-primary rounded-lg + location_city FILL 1)
 * - Heading: "Create Account" headline-lg-mobile, subtitle body-md
 * - Outlined Material 3 inputs with floating labels:
 *   - Full Name, Email Address, Phone Number, Password (with visibility toggle)
 *   - Each: border border-outline-variant rounded-xl px-4 py-4, label absolute left-4 -top-2 bg-surface
 * - Terms checkbox: w-5 h-5 rounded-md
 * - Submit: bg-primary py-4 rounded-xl shadow-lg, title-lg
 * - Divider: "OR" label-lg
 * - Social: Google + Facebook in grid-cols-2 gap-md
 * - Footer: "Already have an account? Sign In" body-md
 * - Legal: © 2024 SmartCivic, label-lg text-outline opacity-60
 */
export default function SignUpScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <ScrollView
        className="flex-1"
        contentContainerClassName="py-8 px-4 items-center"
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full" style={{ maxWidth: 440 }}>

          {/* Mobile Header (Stitch: flex items-center gap-sm) */}
          <View className="flex-row items-center gap-2 mb-8">
            <View className="w-8 h-8 bg-primary rounded-lg items-center justify-center">
              <MaterialIcons name="location-city" size={20} color={COLORS.onPrimary} />
            </View>
            <Text className="text-headline-lg-mobile font-bold text-primary">SmartCivic</Text>
          </View>

          {/* Heading (Stitch: text-left) */}
          <View className="mb-8">
            <Text className="text-headline-lg-mobile font-semibold text-on-surface">Create Account</Text>
            <Text className="text-body-md text-on-surface-variant mt-1">
              Join thousands of citizens making a difference.
            </Text>
          </View>

          {/* Form (Stitch: space-y-md) */}
          <View className="gap-4">
            {/* Full Name — Outlined M3 input */}
            <View className="relative">
              <Text className="absolute left-4 bg-surface text-label-lg font-semibold text-outline px-1 z-10" style={{ top: -8 }}>
                Full Name
              </Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Jane Doe"
                placeholderTextColor="transparent"
                className="w-full px-4 py-4 border border-outline-variant rounded-xl text-body-lg text-on-surface"
                style={{ fontFamily: 'Inter' }}
              />
            </View>

            {/* Email */}
            <View className="relative">
              <Text className="absolute left-4 bg-surface text-label-lg font-semibold text-outline px-1 z-10" style={{ top: -8 }}>
                Email Address
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="jane@example.com"
                placeholderTextColor="transparent"
                keyboardType="email-address"
                autoCapitalize="none"
                className="w-full px-4 py-4 border border-outline-variant rounded-xl text-body-lg text-on-surface"
                style={{ fontFamily: 'Inter' }}
              />
            </View>

            {/* Phone Number */}
            <View className="relative">
              <Text className="absolute left-4 bg-surface text-label-lg font-semibold text-outline px-1 z-10" style={{ top: -8 }}>
                Phone Number
              </Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+1 (555) 000-0000"
                placeholderTextColor="transparent"
                keyboardType="phone-pad"
                className="w-full px-4 py-4 border border-outline-variant rounded-xl text-body-lg text-on-surface"
                style={{ fontFamily: 'Inter' }}
              />
            </View>

            {/* Password */}
            <View className="relative">
              <Text className="absolute left-4 bg-surface text-label-lg font-semibold text-outline px-1 z-10" style={{ top: -8 }}>
                Password
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="transparent"
                secureTextEntry={!showPassword}
                className="w-full px-4 py-4 pr-12 border border-outline-variant rounded-xl text-body-lg text-on-surface"
                style={{ fontFamily: 'Inter' }}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-0 bottom-0 justify-center"
              >
                <MaterialIcons
                  name={showPassword ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={COLORS.onSurfaceVariant}
                />
              </Pressable>
            </View>

            {/* Terms Checkbox (Stitch: flex items-start gap-sm pt-sm) */}
            <View className="flex-row items-start gap-2 pt-2">
              <Pressable
                onPress={() => setTermsAccepted(!termsAccepted)}
                className="w-5 h-5 rounded border border-outline-variant items-center justify-center mt-0.5"
                style={{ backgroundColor: termsAccepted ? COLORS.primary : 'transparent' }}
              >
                {termsAccepted && <MaterialIcons name="check" size={14} color={COLORS.onPrimary} />}
              </Pressable>
              <Text className="text-body-md text-on-surface-variant flex-1">
                I agree to the <Text className="text-primary font-semibold">Terms</Text> and{' '}
                <Text className="text-primary font-semibold">Privacy Policy</Text>
              </Text>
            </View>

            {/* Submit Button (Stitch: bg-primary py-4 rounded-xl shadow-lg mt-lg) */}
            <Pressable
              onPress={() => router.replace('/(tabs)')}
              className="w-full bg-primary py-4 rounded-xl shadow-lg items-center justify-center mt-6 active:scale-95"
            >
              <Text className="text-title-lg font-medium text-on-primary">Create Account</Text>
            </Pressable>
          </View>

          {/* Divider (Stitch: relative flex items-center py-md) */}
          <View className="flex-row items-center py-4 my-2">
            <View className="flex-1 border-t border-outline-variant" />
            <Text className="mx-4 text-label-lg font-semibold text-outline">OR</Text>
            <View className="flex-1 border-t border-outline-variant" />
          </View>

          {/* Social Buttons (Stitch: grid grid-cols-2 gap-md) */}
          <View className="flex-row gap-4">
            <Pressable className="flex-1 flex-row items-center justify-center gap-2 py-3 px-4 border border-outline-variant rounded-xl active:scale-95">
              <MaterialIcons name="g-mobiledata" size={20} color={COLORS.onSurface} />
              <Text className="text-label-lg font-semibold text-on-surface">Google</Text>
            </Pressable>
            <Pressable className="flex-1 flex-row items-center justify-center gap-2 py-3 px-4 border border-outline-variant rounded-xl active:scale-95">
              <MaterialIcons name="facebook" size={20} color="#1877F2" />
              <Text className="text-label-lg font-semibold text-on-surface">Facebook</Text>
            </Pressable>
          </View>

          {/* Footer (Stitch: text-center body-md) */}
          <View className="mt-6 items-center">
            <Text className="text-body-md text-on-surface-variant">
              Already have an account?{' '}
              <Text className="text-primary font-bold" onPress={() => router.push('/(auth)/signin' as any)}>
                Sign In
              </Text>
            </Text>
          </View>

          {/* Legal (Stitch: mt-xl text-center, label-lg text-outline opacity-60) */}
          <View className="mt-8 items-center">
            <Text className="text-label-lg text-outline opacity-60">
              © 2024 SmartCivic. All rights reserved.
            </Text>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
