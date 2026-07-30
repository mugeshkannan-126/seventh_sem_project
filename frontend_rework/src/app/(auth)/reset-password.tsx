import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';

/**
 * Stitch Reset Password Screen Design:
 * - bg-background, centered, max-w-[440px], px-margin-mobile
 * - Atmospheric blobs: top-left primary/5 blur-[120px], bottom-right secondary-container/10 blur-[120px]
 * - Back nav: arrow_back 20px + "Back" label-lg, group hover:text-primary
 * - Hero: 64px icon container (w-16 h-16 rounded-3xl bg-surface-container-highest border), key icon 32px FILL 1
 * - Title: headline-lg-mobile, "Reset Password", mb-sm
 * - Description: body-lg, text-on-surface-variant, max-w-[320px]
 * - Form card: bg-surface-container-lowest border border-outline-variant p-lg rounded-[24px] shadow-sm
 * - Email input: label-lg label, 20px mail icon, h-14 rounded-xl border
 * - Submit: h-14 bg-primary rounded-xl, "Send Reset Link" + send icon
 * - Success state: check_circle 28px green, "Check your email" title-lg
 * - Footer: "Remember your password? Log in" body-md
 */
export default function ResetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = () => {
    if (!email) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1800);
  };

  const resetView = () => {
    setIsSubmitted(false);
    setEmail('');
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Atmospheric blobs */}
      <View
        className="absolute rounded-full opacity-5"
        style={{ top: '-10%', left: '-10%', width: '40%', height: '40%', backgroundColor: COLORS.primary }}
      />
      <View
        className="absolute rounded-full opacity-10"
        style={{ bottom: '-10%', right: '-10%', width: '40%', height: '40%', backgroundColor: COLORS.secondaryContainer }}
      />

      <View className="flex-1 justify-center px-4">
        <View className="w-full" style={{ maxWidth: 440 }}>

          {/* Back nav (Stitch: group flex items-center gap-2 py-2) */}
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center gap-2 py-2 mb-6 active:opacity-70"
          >
            <MaterialIcons name="arrow-back" size={20} color={COLORS.onSurfaceVariant} />
            <Text className="text-label-lg text-on-surface-variant">Back</Text>
          </Pressable>

          {/* Hero section (Stitch: mb-xl text-center md:text-left) */}
          <View className="mb-8">
            {/* Icon container (Stitch: w-16 h-16 rounded-3xl bg-surface-container-highest mb-lg) */}
            <View
              className="w-16 h-16 rounded-3xl bg-surface-container-highest mb-6 items-center justify-center"
              style={{ borderWidth: 1, borderColor: 'rgba(195, 198, 215, 0.3)' }}
            >
              <MaterialIcons name="vpn-key" size={32} color={COLORS.primary} />
            </View>
            <Text className="text-headline-lg-mobile font-semibold text-on-surface mb-2">
              Reset Password
            </Text>
            <Text className="text-body-lg text-on-surface-variant" style={{ maxWidth: 320 }}>
              Enter your email to receive a password reset link to your registered account.
            </Text>
          </View>

          {/* Form Card (Stitch: bg-surface-container-lowest border p-lg rounded-[24px] shadow-sm) */}
          <View
            className="bg-surface-container-lowest border border-outline-variant p-6 shadow-sm"
            style={{ borderRadius: 24 }}
          >
            {!isSubmitted ? (
              <View className="gap-6">
                {/* Email input group */}
                <View className="gap-2">
                  <Text className="text-label-lg font-semibold text-on-surface-variant">
                    Email Address
                  </Text>
                  <View className="flex-row items-center bg-surface rounded-xl border border-outline-variant h-14 px-4">
                    <MaterialIcons name="mail" size={20} color={COLORS.outline} style={{ marginRight: 8 }} />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="name@example.com"
                      placeholderTextColor={COLORS.outline}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      className="flex-1 text-body-lg text-on-surface"
                      style={{ fontFamily: 'Inter' }}
                    />
                  </View>
                </View>

                {/* Submit button (Stitch: h-14 bg-primary rounded-xl) */}
                <Pressable
                  onPress={handleReset}
                  disabled={isLoading}
                  className="w-full h-14 bg-primary rounded-xl items-center justify-center flex-row gap-2 active:scale-[0.98]"
                  style={{ opacity: isLoading ? 0.8 : 1 }}
                >
                  {isLoading ? (
                    <MaterialIcons name="hourglass-empty" size={20} color={COLORS.onPrimary} />
                  ) : (
                    <>
                      <Text className="text-title-lg font-medium text-on-primary">Send Reset Link</Text>
                      <MaterialIcons name="send" size={20} color={COLORS.onPrimary} />
                    </>
                  )}
                </Pressable>
              </View>
            ) : (
              /* Success state (Stitch: text-center py-4 space-y-4) */
              <View className="items-center py-4 gap-4">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: 'rgba(107, 255, 143, 0.3)' }}
                >
                  <MaterialIcons name="check-circle" size={28} color={COLORS.onSecondaryContainer} />
                </View>
                <View className="items-center">
                  <Text className="text-title-lg font-medium text-on-surface">Check your email</Text>
                  <Text className="text-body-md text-on-surface-variant mt-2 text-center">
                    If an account exists for{' '}
                    <Text className="font-semibold text-on-surface">{email}</Text>, you'll receive a
                    password reset link shortly.
                  </Text>
                </View>
                <Pressable onPress={resetView} className="py-2">
                  <Text className="text-label-lg font-semibold text-primary">
                    Try another email address
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Footer (Stitch: mt-lg text-center) */}
          <View className="mt-6 items-center">
            <Text className="text-body-md text-on-surface-variant">
              Remember your password?{' '}
              <Text
                className="text-primary font-semibold"
                onPress={() => router.push('/(auth)/signin' as any)}
              >
                Log in
              </Text>
            </Text>
          </View>

        </View>
      </View>
    </SafeAreaView>
  );
}
