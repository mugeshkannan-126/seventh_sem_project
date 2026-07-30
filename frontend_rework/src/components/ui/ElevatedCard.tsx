import React from 'react';
import { Pressable, View, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { ELEVATION } from '@/constants/theme';

interface ElevatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  elevation?: 0 | 1 | 2 | 3;
  className?: string;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Stitch Elevated Card Design:
 * - bg-surface-container-lowest, rounded-card (24px)
 * - border border-outline-variant
 * - Level 1: shadow-sm (default)
 * - Level 2: shadow-md (interactive cards)
 * - active:scale-[0.98] transition
 */
export function ElevatedCard({
  children,
  onPress,
  elevation = 1,
  className = '',
  style,
}: ElevatedCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const elevationStyle = ELEVATION[elevation];

  if (!onPress) {
    return (
      <View
        className={`bg-surface-container-lowest rounded-card border border-outline-variant ${className}`}
        style={[elevationStyle, style]}
      >
        {children}
      </View>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withTiming(0.98, { duration: 120 }); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 200 }); }}
      className={`bg-surface-container-lowest rounded-card border border-outline-variant ${className}`}
      style={[animatedStyle, elevationStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}
