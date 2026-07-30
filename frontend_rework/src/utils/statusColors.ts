import { COLORS } from '@/constants/colors';
import type { ComplaintStatus } from '@/types';

export interface StatusStyle {
  bg: string;
  text: string;
  label: string;
  icon: string;
}

const STATUS_MAP: Record<ComplaintStatus, StatusStyle> = {
  pending: { bg: '#FEF3C7', text: '#92400E', label: 'Pending', icon: 'schedule' },
  in_progress: { bg: '#DBEAFE', text: '#1E40AF', label: 'In Progress', icon: 'autorenew' },
  resolved: { bg: '#D1FAE5', text: '#065F46', label: 'Resolved', icon: 'check_circle' },
  critical: { bg: '#FEE2E2', text: '#991B1B', label: 'Critical', icon: 'warning' },
  rejected: { bg: '#F3F4F6', text: '#374151', label: 'Rejected', icon: 'cancel' },
};

export function getStatusStyle(status: ComplaintStatus): StatusStyle {
  return STATUS_MAP[status] ?? STATUS_MAP.pending;
}

export function getStatusLabel(status: ComplaintStatus): string {
  return STATUS_MAP[status]?.label ?? status;
}
