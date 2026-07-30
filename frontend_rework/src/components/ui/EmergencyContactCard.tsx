import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { EmergencyContact } from '@/types';

interface EmergencyContactCardProps {
  contact: EmergencyContact;
  onPress: (phone: string) => void;
}

export function EmergencyContactCard({ contact, onPress }: EmergencyContactCardProps) {
  return (
    <Pressable
      onPress={() => onPress(contact.phone)}
      className="bg-surface-container-low p-4 rounded-xl flex-row items-center justify-between active:bg-surface-container"
    >
      <View className="flex-row items-center gap-4">
        <View className={`w-10 h-10 rounded-full items-center justify-center ${contact.iconBgClass}`}>
          <Text className={contact.iconColorClass}>{contact.icon}</Text>
        </View>
        <View>
          <Text className="text-body-lg font-bold text-on-surface">{contact.title}</Text>
          <Text className="text-label-lg text-on-surface-variant">{contact.subtitle}</Text>
        </View>
      </View>
      <Text className="text-error text-xl">📞</Text>
    </Pressable>
  );
}
