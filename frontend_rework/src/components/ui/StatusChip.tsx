import React from 'react';
import { View, Text } from 'react-native';
import { getStatusStyle } from '@/utils/statusColors';
import type { ComplaintStatus } from '@/types';

interface StatusChipProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md';
}

export function StatusChip({ status, size = 'md' }: StatusChipProps) {
  const style = getStatusStyle(status);
  const isSmall = size === 'sm';

  return (
    <View
      className={`self-start rounded-full flex-row items-center ${isSmall ? 'px-2 py-0.5' : 'px-3 py-1'}`}
      style={{ backgroundColor: style.bg }}
    >
      <Text
        className={`font-semibold ${isSmall ? 'text-[10px]' : 'text-[12px]'}`}
        style={{ color: style.text }}
      >
        {style.label}
      </Text>
    </View>
  );
}
