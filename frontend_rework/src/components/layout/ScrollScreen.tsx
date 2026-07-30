import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScrollScreenProps {
  children: React.ReactNode;
  className?: string;
  padBottom?: boolean;
}

/** Full-screen scrollable layout with safe area insets */
export function ScrollScreen({ children, className = '', padBottom = true }: ScrollScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName={`pb-24 ${className}`}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
