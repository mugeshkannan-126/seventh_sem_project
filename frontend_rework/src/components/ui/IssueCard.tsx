import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { StatusChip } from './StatusChip';
import { formatRelativeTime } from '@/utils/formatDate';
import type { Complaint } from '@/types';

interface IssueCardProps {
  complaint: Complaint;
  onPress: (id: string) => void;
  width?: number;
}

export function IssueCard({ complaint, onPress, width = 280 }: IssueCardProps) {
  return (
    <Pressable
      onPress={() => onPress(complaint.id)}
      className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden shadow-sm active:shadow-md"
      style={{ width, minWidth: width }}
    >
      {complaint.images[0] ? (
        <View className="h-40 overflow-hidden relative">
          <Image
            source={complaint.images[0]}
            className="w-full h-full"
            contentFit="cover"
            transition={200}
          />
          <View className="absolute top-3 left-3">
            <StatusChip status={complaint.status} size="sm" />
          </View>
        </View>
      ) : null}

      <View className="p-4">
        <Text className="text-body-lg font-bold text-on-surface" numberOfLines={1}>
          {complaint.title}
        </Text>
        <Text className="text-body-md text-on-surface-variant mt-1" numberOfLines={2}>
          {complaint.description}
        </Text>
        <View className="mt-4 pt-3 border-t border-outline-variant flex-row justify-between items-center">
          <Text className="text-label-lg text-on-surface-variant">
            {formatRelativeTime(complaint.createdAt)}
          </Text>
          <Pressable>
            <Text className="text-label-lg text-primary font-bold">Details →</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}
