import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

interface TopAppBarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showAvatar?: boolean;
  showNotification?: boolean;
  rightAction?: React.ReactNode;
  className?: string;
}

/**
 * Stitch Home Dashboard Top App Bar:
 * - h-16, px-margin-mobile (16px), bg-surface
 * - Left: avatar circle (w-10 h-10 bg-primary-container) with account_circle icon
 * - "SmartCivic" in headline-lg-mobile font-bold text-primary
 * - Subtitle with location_on icon in label-lg text-on-surface-variant
 * - Right: notification bell in w-10 h-10 rounded-full
 */
export function TopAppBar({
  title = 'SmartCivic',
  subtitle,
  showBack = false,
  showAvatar = true,
  showNotification = true,
  rightAction,
  className = '',
}: TopAppBarProps) {
  const router = useRouter();

  return (
    <View
      className={`h-16 flex-row items-center justify-between px-4 bg-surface ${className}`}
    >
      <View className="flex-row items-center gap-3">
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center"
          >
            <MaterialIcons name="arrow-back" size={20} color={COLORS.onSurfaceVariant} />
          </Pressable>
        )}
        {showAvatar && !showBack && (
          <View className="w-10 h-10 rounded-full bg-primary-container items-center justify-center">
            <MaterialIcons name="account-circle" size={24} color={COLORS.onPrimaryContainer} />
          </View>
        )}
        <View>
          <Text className="text-headline-lg-mobile font-bold text-primary leading-none">
            {title}
          </Text>
          {subtitle ? (
            <View className="flex-row items-center gap-1 mt-0.5">
              <MaterialIcons name="location-on" size={14} color={COLORS.onSurfaceVariant} />
              <Text className="text-label-lg text-on-surface-variant">{subtitle}</Text>
            </View>
          ) : null}
        </View>
      </View>
      {rightAction ? (
        <View>{rightAction}</View>
      ) : showNotification ? (
        <Pressable className="w-10 h-10 rounded-full items-center justify-center active:bg-surface-variant">
          <MaterialIcons name="notifications" size={24} color={COLORS.onSurfaceVariant} />
        </Pressable>
      ) : null}
    </View>
  );
}
