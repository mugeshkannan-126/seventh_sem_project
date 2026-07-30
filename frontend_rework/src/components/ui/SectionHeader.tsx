import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View className="flex-row justify-between items-center mb-3">
      <Text className="text-title-lg font-semibold text-on-surface">{title}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} className="flex-row items-center gap-1">
          <Text className="text-label-lg text-primary font-semibold">{actionLabel}</Text>
          <Text className="text-primary text-sm">→</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
