import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SafeScreenProps {
  children: React.ReactNode;
  className?: string;
}

/** Full-screen non-scrollable layout with safe area insets */
export function SafeScreen({ children, className = '' }: SafeScreenProps) {
  return (
    <SafeAreaView className={`flex-1 bg-background ${className}`} edges={['top', 'left', 'right']}>
      <View className="flex-1">{children}</View>
    </SafeAreaView>
  );
}
