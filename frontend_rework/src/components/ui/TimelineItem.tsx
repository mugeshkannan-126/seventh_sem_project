import React from 'react';
import { View, Text } from 'react-native';
import type { TimelineEvent } from '@/types';
import { formatTime } from '@/utils/formatDate';
import { COLORS } from '@/constants/colors';

interface TimelineItemProps {
  event: TimelineEvent;
  isLast?: boolean;
}

export function TimelineItem({ event, isLast = false }: TimelineItemProps) {
  const dotColor = event.isCompleted
    ? COLORS.secondary
    : event.isActive
    ? COLORS.primary
    : COLORS.outlineVariant;

  return (
    <View className="flex-row gap-4">
      {/* Dot + connector line */}
      <View className="items-center w-6">
        <View
          className="w-6 h-6 rounded-full items-center justify-center"
          style={{ backgroundColor: dotColor }}
        >
          <Text className="text-white text-[10px] font-bold">
            {event.isCompleted ? '✓' : event.isActive ? '•' : ''}
          </Text>
        </View>
        {!isLast && (
          <View
            className="flex-1 w-0.5 mt-1"
            style={{ backgroundColor: event.isCompleted ? COLORS.secondary : COLORS.outlineVariant }}
          />
        )}
      </View>

      {/* Content */}
      <View className="flex-1 pb-6">
        <Text
          className="text-body-md font-semibold text-on-surface"
          style={{ color: event.isActive ? COLORS.primary : undefined }}
        >
          {event.label}
        </Text>
        <Text className="text-body-md text-on-surface-variant mt-0.5">{event.description}</Text>
        {event.timestamp ? (
          <Text className="text-label-lg text-outline mt-1">{formatTime(event.timestamp)}</Text>
        ) : null}
      </View>
    </View>
  );
}
