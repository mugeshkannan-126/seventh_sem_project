import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

interface IconProps {
  color?: string;
  size?: number;
}

export const GovBuilding = ({ color = '#00386c', size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L2 7V9H22V7L12 2Z"
      fill={color}
    />
    <Rect x="4" y="11" width="2" height="8" rx="0.5" fill={color} />
    <Rect x="9" y="11" width="2" height="8" rx="0.5" fill={color} />
    <Rect x="14" y="11" width="2" height="8" rx="0.5" fill={color} />
    <Rect x="19" y="11" width="2" height="8" rx="0.5" fill={color} />
    <Path
      d="M1 21H23V23H1V21Z"
      fill={color}
    />
  </Svg>
);

export const MailIcon = ({ color = '#737781', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
      fill={color}
    />
  </Svg>
);

export const LockIcon = ({ color = '#737781', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM9 6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8H9V6ZM18 20H6V10H18V20ZM12 13C10.9 13 10 13.9 10 15C10 16.1 10.9 17 12 17C13.1 17 14 16.1 14 15C14 13.9 13.1 13 12 13Z"
      fill={color}
    />
  </Svg>
);

export const PersonIcon = ({ color = '#737781', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 12C14.76 12 17 9.76 17 7C17 4.24 14.76 2 12 2C9.24 2 7 4.24 7 7C7 9.76 9.24 12 12 12ZM12 14C8.66 14 2 15.66 2 19V22H22V19C22 15.66 15.34 14 12 14Z"
      fill={color}
    />
  </Svg>
);

export const VisibilityIcon = ({ color = '#737781', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
      fill={color}
    />
  </Svg>
);

export const VisibilityOffIcon = ({ color = '#737781', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 7C14.76 7 17 9.24 17 12C17 12.82 16.79 13.59 16.44 14.28L19.39 17.23C21.31 15.82 22.45 13.93 23 12C21.27 7.61 17 4.5 12 4.5C10.82 4.5 9.67 4.7 8.6 5.07L10.7 7.17C11.12 7.06 11.55 7 12 7ZM2 4.27L4.28 6.55L4.78 7.05C3.28 8.37 2.05 10.05 1 12C2.73 16.39 7 19.5 12 19.5C13.79 19.5 15.48 19.06 16.95 18.28L17.45 18.78L19.73 21.06L21 19.78L3.27 2.05L2 4.27ZM7.53 9.8L9.84 12.11C9.43 12.63 9.4 13.4 9.93 13.93C10.46 14.46 11.23 14.43 11.75 14.02L13.96 16.23C13.34 16.64 12.63 17 12 17C9.24 17 7 14.76 7 12C7 11.13 7.21 10.32 7.53 9.8ZM11.84 9.02L14.98 12.16C14.99 12.11 15 12.06 15 12C15 10.34 13.66 9 12 9C11.94 9 11.89 9.01 11.84 9.02Z"
      fill={color}
    />
  </Svg>
);

export const ArrowRight = ({ color = '#ffffff', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z"
      fill={color}
    />
  </Svg>
);

export const GovIdIcon = ({ color = '#0b1c30', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="16" rx="2" stroke={color} strokeWidth="2" />
    <Circle cx="8" cy="10" r="2.5" stroke={color} strokeWidth="2" />
    <Path d="M5 17C5 15 7 14 8 14C9 14 11 15 11 17" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M14 9H18M14 13H18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const FingerprintIcon = ({ color = '#0b1c30', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.81 4.47A9.973 9.973 0 0 0 12 2C9.17 2 6.58 3.51 5.17 6.03M19.98 11c-.04-.82-.15-1.64-.32-2.45M2 11.02a9.92 9.92 0 0 0 .5 3.09M22 11c0-1.85-.5-3.59-1.39-5.08M3.61 7.68A7.953 7.953 0 0 0 4 11c0 1.29.31 2.52.87 3.61M8.11 3.59C9.28 2.57 10.82 2 12 2c1.7 0 3.32.78 4.38 2.15M16 11c0 2.21-1.79 4-4 4s-4-1.79-4-4M12 8c-1.66 0-3 1.34-3 3M15 11c0-1.66-1.34-3-3-3"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M12 17c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1s-1 .45-1 1v1c0 .55.45 1 1 1z"
      fill={color}
    />
  </Svg>
);

export const HomeIcon = ({ color = '#00386c', size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z"
      fill={color}
    />
  </Svg>
);

export const PlusIcon = ({ color = '#ffffff', size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"
      fill={color}
    />
  </Svg>
);

export const ListIcon = ({ color = '#737781', size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 13H5V11H3V13ZM3 17H5V15H3V17ZM3 9H5V7H3V9ZM7 13H21V11H7V13ZM7 17H21V15H7V17ZM7 7V9H21V7H7Z"
      fill={color}
    />
  </Svg>
);

export const MapPinIcon = ({ color = '#737781', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
      fill={color}
    />
  </Svg>
);

export const InfoIcon = ({ color = '#737781', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z"
      fill={color}
    />
  </Svg>
);

export const CameraIcon = ({ color = '#737781', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3.2" fill={color} />
    <Path
      d="M9 2L7.17 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4H16.83L15 2H9ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17Z"
      fill={color}
    />
  </Svg>
);

export const ClockIcon = ({ color = '#e8a900', size = 16 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z"
      fill={color}
    />
  </Svg>
);

export const CheckCircleIcon = ({ color = '#00a86b', size = 16 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
      fill={color}
    />
  </Svg>
);

export const CloseIcon = ({ color = '#737781', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
      fill={color}
    />
  </Svg>
);

export const BellIcon = ({ color = '#737781', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
      fill={color}
    />
  </Svg>
);

export const PotholeIcon = ({ color = '#424750', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19.78 12.82L15.3 15.3l-2.6-3.8-3.4 3.4-3-3L4 14v4h16v-5.18z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 20h20M2 17h2"
      stroke={color}
      strokeWidth="2"
    />
  </Svg>
);

export const LeakageIcon = ({ color = '#424750', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
      fill={color}
    />
  </Svg>
);

export const LightbulbIcon = ({ color = '#424750', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"
      fill={color}
    />
  </Svg>
);

export const TrashIcon = ({ color = '#424750', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
      fill={color}
    />
  </Svg>
);

export const ActivityIcon = ({ color = '#737781', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z"
      fill={color}
    />
  </Svg>
);

export const SettingsIcon = ({ color = '#737781', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
      fill={color}
    />
  </Svg>
);

export const GlobeIcon = ({ color = '#737781', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    <Path d="M2 12h20" />
  </Svg>
);

export const SearchIcon = ({ color = '#737781', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" />
    <Path d="M21 21l-4.35-4.35" />
  </Svg>
);

export const FilterIcon = ({ color = '#737781', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
  </Svg>
);

export const CheckAllIcon = ({ color = '#737781', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 6L7 17l-5-5" />
    <Path d="M22 10l-5.5 5.5" />
  </Svg>
);

export const EditIcon = ({ color = '#737781', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Svg>
);

export const ArrowUpIcon = ({ color = '#737781', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 19V5M5 12l7-7 7 7" />
  </Svg>
);

export const ShareIcon = ({ color = '#737781', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="18" cy="5" r="3" />
    <Circle cx="6" cy="12" r="3" />
    <Circle cx="18" cy="19" r="3" />
    <Path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" />
  </Svg>
);

export const MapIcon = ({ color = '#737781', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 6l7-4 7 4 4-2v14l-4 2-7-4-7 4-4-2V6z" />
    <Path d="M10 2v14M17 6v14" />
  </Svg>
);

