import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  GovBuilding,
  PersonIcon,
  HomeIcon,
  PlusIcon,
  ArrowRight,
} from '../components/Icons';
import { session } from '../services/api';

export default function ProfileScreen() {
  const router = useRouter();
  const user = session.getUser();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of CivicFlow?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          session.logout();
          router.push('/');
        },
      },
    ]);
  };

  // Extract initials for the profile avatar placeholder
  const getInitials = (nameStr: string) => {
    if (!nameStr) return 'C';
    return nameStr
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9ff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBranding}>
          <GovBuilding size={24} color="#00386c" />
          <Text style={styles.headerTitle}>CivicFlow</Text>
        </View>
        <Text style={styles.headerSubtitle}>User Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'citizen@city.gov'}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{user?.role || 'Citizen'}</Text>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>User ID</Text>
              <Text style={styles.detailValue}>CF-{user?.user_id || '9921'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phone Number</Text>
              <Text style={styles.detailValue}>{user?.phone || 'Not Provided'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Department ID</Text>
              <Text style={styles.detailValue}>
                {user?.department_id !== null && user?.department_id !== undefined
                  ? user.department_id
                  : 'None (Citizen Account)'}
              </Text>
            </View>
          </View>
        </View>

        {/* Options List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.optionsCard}>
            <TouchableOpacity style={styles.optionItem} activeOpacity={0.7}>
              <Text style={styles.optionText}>Notifications Settings</Text>
              <Text style={styles.optionSub}>Enabled</Text>
            </TouchableOpacity>
            <View style={styles.optionDivider} />
            <TouchableOpacity style={styles.optionItem} activeOpacity={0.7}>
              <Text style={styles.optionText}>Language</Text>
              <Text style={styles.optionSub}>English</Text>
            </TouchableOpacity>
            <View style={styles.optionDivider} />
            <TouchableOpacity style={styles.optionItem} activeOpacity={0.7}>
              <Text style={styles.optionText}>Dark Mode</Text>
              <Text style={styles.optionSub}>Disabled</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.9}>
          <Text style={styles.logoutButtonText}>Log Out Securely</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Reusable Bottom Navigation Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/')}>
          <HomeIcon size={24} color="#737781" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/complaint')}>
          <PlusIcon size={24} color="#737781" />
          <Text style={styles.tabLabel}>Report</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/profile')}>
          <PersonIcon size={24} color="#00386c" />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  header: {
    height: 64,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eff4ff',
  },
  headerBranding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00386c',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a83900',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
    gap: 24,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#0b1c30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(194, 202, 209, 0.2)',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00386c',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#00386c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0b1c30',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#737781',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: 'rgba(0, 56, 108, 0.06)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00386c',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0b1c30',
    marginLeft: 4,
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(194, 202, 209, 0.2)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#737781',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0b1c30',
  },
  optionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(194, 202, 209, 0.2)',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0b1c30',
  },
  optionSub: {
    fontSize: 13,
    color: '#737781',
  },
  optionDivider: {
    height: 1,
    backgroundColor: '#eff4ff',
  },
  logoutButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#ba1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#ba1a1a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 64,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eff4ff',
    paddingBottom: Platform.OS === 'ios' ? 12 : 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  tabLabel: {
    fontSize: 11,
    color: '#737781',
    fontWeight: '500',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#00386c',
    fontWeight: '700',
  },
});
