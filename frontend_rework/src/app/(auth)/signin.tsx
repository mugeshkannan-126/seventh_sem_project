import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';

/**
 * Stitch Sign In Screen Design:
 * - bg-surface, centered, max-w-[440px]
 * - Branding: icon in p-md rounded-3xl bg-primary-container, account_balance 48px
 *   "SmartCivic" headline-lg-mobile, "Empowering Your Community" body-lg text-on-surface-variant
 * - Login card: glass-card (bg-white/80 backdrop-blur border), rounded-[32px], p-xl
 *   "Welcome back" title-lg, "Access your civic dashboard..." body-md
 * - Email: label-lg, input bg-surface-container-lowest border border-outline-variant rounded-xl px-md py-3
 *   mail icon, placeholder text-outline-variant
 * - Password: same styling, lock icon, visibility toggle, "Forgot Password?" link
 * - Sign In button: w-full bg-primary h-14 rounded-xl shadow-md, title-lg, arrow_forward icon
 * - Divider: "OR" label-lg uppercase tracking-widest
 * - Google: bg-surface-container-low border, h-14 rounded-xl, Google SVG + text
 * - Footer: "Don't have an account? Sign Up" body-md
 * - System status: dot + "Systems Active", verified_user + "Secure Session"
 * - Atmospheric blobs
 */
export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-1 justify-center items-center px-4"
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full" style={{ maxWidth: 440 }}>

          {/* Branding Header (Stitch: flex-col items-center mb-xl) */}
          <View className="items-center mb-8">
            <View className="mb-6 p-4 rounded-3xl bg-primary-container shadow-lg items-center justify-center">
              <MaterialIcons name="account-balance" size={48} color={COLORS.onPrimaryContainer} />
            </View>
            <Text className="text-headline-lg-mobile font-semibold text-on-surface text-center tracking-tight">
              SmartCivic
            </Text>
            <Text className="text-body-lg text-on-surface-variant mt-2">
              Empowering Your Community
            </Text>
          </View>

          {/* Login Card (Stitch: glass-card rounded-[32px] p-xl shadow-xl) */}
          <View
            className="bg-surface-container-lowest border border-outline-variant shadow-lg"
            style={{ borderRadius: 32, padding: 32 }}
          >
            {/* Heading */}
            <View className="mb-6">
              <Text className="text-title-lg font-medium text-on-surface mb-1">Welcome back</Text>
              <Text className="text-body-md text-on-surface-variant">
                Access your civic dashboard to stay updated.
              </Text>
            </View>

            {/* Email Field (Stitch: space-y-sm) */}
            <View className="mb-6">
              <Text className="text-label-lg font-semibold text-on-surface-variant px-1 mb-2">
                Email Address
              </Text>
              <View className="flex-row items-center bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3">
                <MaterialIcons name="mail" size={20} color={COLORS.outline} style={{ marginRight: 8 }} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  placeholderTextColor={COLORS.outlineVariant}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="flex-1 text-body-lg text-on-surface"
                  style={{ fontFamily: 'Inter' }}
                />
              </View>
            </View>

            {/* Password Field */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center px-1 mb-2">
                <Text className="text-label-lg font-semibold text-on-surface-variant">Password</Text>
                <Pressable onPress={() => router.push('/(auth)/reset-password' as any)}>
                  <Text className="text-label-lg font-semibold text-primary">Forgot Password?</Text>
                </Pressable>
              </View>
              <View className="flex-row items-center bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3">
                <MaterialIcons name="lock" size={20} color={COLORS.outline} style={{ marginRight: 8 }} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.outlineVariant}
                  secureTextEntry={!showPassword}
                  className="flex-1 text-body-lg text-on-surface"
                  style={{ fontFamily: 'Inter' }}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color={COLORS.outline}
                  />
                </Pressable>
              </View>
            </View>

            {/* Sign In Button (Stitch: w-full bg-primary h-14 rounded-xl shadow-md) */}
            <Pressable
              onPress={() => router.replace('/(tabs)')}
              className="w-full bg-primary h-14 rounded-xl shadow-md items-center justify-center flex-row gap-2 active:scale-[0.98]"
            >
              <Text className="text-title-lg font-medium text-on-primary">Sign In</Text>
              <MaterialIcons name="arrow-forward" size={20} color={COLORS.onPrimary} />
            </Pressable>

            {/* Divider (Stitch: flex items-center gap-md py-sm) */}
            <View className="flex-row items-center gap-4 py-3 my-2">
              <View className="flex-1 h-px bg-outline-variant" />
              <Text className="text-label-lg font-semibold text-on-surface-variant uppercase tracking-widest">or</Text>
              <View className="flex-1 h-px bg-outline-variant" />
            </View>

            {/* Google Sign In (Stitch: bg-surface-container-low border h-14 rounded-xl) */}
            <Pressable
              className="w-full bg-surface-container-low border border-outline-variant h-14 rounded-xl items-center justify-center flex-row gap-2 active:scale-[0.98]"
            >
              <MaterialIcons name="g-mobiledata" size={24} color={COLORS.onSurface} />
              <Text className="text-title-lg font-medium text-on-surface">Continue with Google</Text>
            </Pressable>
          </View>

          {/* Footer Link (Stitch: mt-lg text-center) */}
          <View className="mt-6 items-center">
            <Text className="text-body-md text-on-surface-variant">
              Don't have an account?{' '}
              <Text
                className="text-primary font-bold"
                onPress={() => router.push('/(auth)/signup' as any)}
              >
                Sign Up
              </Text>
            </Text>
          </View>

          {/* System Status (Stitch: mt-xl flex items-center justify-center gap-lg) */}
          <View className="mt-8 flex-row items-center justify-center gap-6">
            <View className="flex-row items-center gap-1">
              <View className="w-2 h-2 rounded-full bg-secondary-container" />
              <Text className="text-label-lg text-on-surface-variant">Systems Active</Text>
            </View>
            <View className="w-px h-3 bg-outline-variant" />
            <View className="flex-row items-center gap-1">
              <MaterialIcons name="verified-user" size={14} color={COLORS.onSurfaceVariant} />
              <Text className="text-label-lg text-on-surface-variant">Secure Session</Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
