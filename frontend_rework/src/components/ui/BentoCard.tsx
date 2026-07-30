import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

interface BentoCardProps {
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  bgIcon?: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Stitch Bento Card Design:
 * - bg-primary-container / bg-secondary-container
 * - p-6, rounded-card (24px), min-h-[160px]
 * - Large foreground icon at 32px
 * - Background decorative icon at 120px, absolute -right-4 -bottom-4, opacity-10
 * - shadow-lg, active:scale-[0.98]
 */
export function BentoCard({
  title,
  description,
  icon,
  bgIcon,
  onPress,
  variant = 'primary',
  className = '',
}: BentoCardProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isPrimary = variant === 'primary';
  const containerBg = isPrimary ? 'bg-primary-container' : 'bg-secondary-container';
  const textColor = isPrimary ? COLORS.onPrimaryContainer : COLORS.onSecondaryContainer;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withTiming(0.98, { duration: 120 }); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 200 }); }}
      style={[animatedStyle]}
      className={`${containerBg} rounded-card p-6 min-h-[160px] relative overflow-hidden flex-1 shadow-lg ${className}`}
    >
      {/* Foreground content */}
      <View className="z-10 flex-1">
        <MaterialIcons
          name={icon}
          size={32}
          color={textColor}
          style={{ marginBottom: 8 }}
        />
        <Text
          className="text-title-lg font-bold"
          style={{ color: textColor }}
        >
          {title}
        </Text>
        <Text
          className="text-body-md mt-1 opacity-90"
          style={{ color: textColor }}
        >
          {description}
        </Text>
      </View>
      {/* Background decorative icon */}
      {bgIcon && (
        <View className="absolute -right-4 -bottom-4 opacity-10">
          <MaterialIcons name={bgIcon} size={120} color={textColor} />
        </View>
      )}
    </AnimatedPressable>
  );
}
