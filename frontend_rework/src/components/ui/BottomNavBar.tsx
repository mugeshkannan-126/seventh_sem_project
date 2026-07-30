import React from 'react';
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export type TabName = 'home' | 'map' | 'report' | 'feed' | 'profile';

interface NavItem {
  key: TabName;
  icon: keyof typeof MaterialIcons.glyphMap;
}

/**
 * Stitch design specifies these exact Material Symbols:
 * home, map, add_circle, group, person
 * Mapped to @expo/vector-icons MaterialIcons equivalents.
 */
const NAV_ITEMS: NavItem[] = [
  { key: 'home', icon: 'home' },
  { key: 'map', icon: 'map' },
  { key: 'report', icon: 'add-circle' },
  { key: 'feed', icon: 'group' },
  { key: 'profile', icon: 'person' },
];

interface BottomNavBarProps {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Floating pill bottom nav from Stitch design:
 * - h-16, w-[90%], max-w-[400px], centered at bottom-6
 * - bg-white/70, backdrop-blur-md, border border-white/20, shadow-lg, rounded-full
 * - Active: bg-primary text-white rounded-full w-12 h-12, icon filled (FILL 1)
 * - Inactive: text-on-surface-variant w-12 h-12
 */
function NavButton({ item, isActive, onPress }: { item: NavItem; isActive: boolean; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={() => {
        scale.value = withSequence(
          withSpring(0.9, { damping: 12 }),
          withSpring(1, { damping: 12 })
        );
        onPress();
      }}
      style={animatedStyle}
      className={`w-12 h-12 rounded-full items-center justify-center ${
        isActive ? 'bg-primary' : ''
      }`}
    >
      <MaterialIcons
        name={item.icon}
        size={24}
        color={isActive ? COLORS.onPrimary : COLORS.onSurfaceVariant}
      />
    </AnimatedPressable>
  );
}

export function BottomNavBar({ activeTab, onTabPress }: BottomNavBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute left-0 right-0 items-center"
      style={{ bottom: Math.max(insets.bottom + 8, 24) }}
      pointerEvents="box-none"
    >
      <View
        className="flex-row justify-around items-center px-2 rounded-full shadow-lg"
        style={{
          width: '90%',
          maxWidth: 400,
          height: 64,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
        }}
      >
        {NAV_ITEMS.map((item) => (
          <NavButton
            key={item.key}
            item={item}
            isActive={activeTab === item.key}
            onPress={() => onTabPress(item.key)}
          />
        ))}
      </View>
    </View>
  );
}
