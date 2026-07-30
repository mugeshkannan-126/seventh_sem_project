import React from 'react';
import { View, Text } from 'react-native';

interface StatCardProps {
  value: string | number;
  label: string;
  valueColor?: string;
}

/**
 * Stitch Stat Card Design:
 * - bg-surface-container-lowest, p-4, rounded-card (24px)
 * - border border-outline-variant, text-center
 * - shadow-sm, hover:shadow-md (web only)
 * - Value: headline-lg size, leading-none
 * - Label: label-lg, text-on-surface-variant, mt-1
 */
export function StatCard({ value, label, valueColor }: StatCardProps) {
  return (
    <View className="flex-1 bg-surface-container-lowest p-4 rounded-card border border-outline-variant items-center shadow-sm">
      <Text
        className="text-headline-lg font-bold leading-none"
        style={{ color: valueColor ?? '#004ac6' }}
      >
        {value}
      </Text>
      <Text className="text-label-lg text-on-surface-variant mt-1">{label}</Text>
    </View>
  );
}
