import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  GovBuilding,
  MailIcon,
  LockIcon,
  PersonIcon,
  VisibilityIcon,
  VisibilityOffIcon,
  ArrowRight,
  GovIdIcon,
  FingerprintIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  BellIcon,
  HomeIcon,
  PlusIcon,
  GlobeIcon,
  TrashIcon,
  EditIcon,
  MapIcon,
  BoldPlusIcon,
} from '../components/Icons';
import { API_BASE, session } from '../services/api';

export default function AppScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(session.isLoggedIn());
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Loading and data states
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [fetchingReports, setFetchingReports] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [editingReport, setEditingReport] = useState<any>(null);
  const [editDescription, setEditDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    session.init().then(() => {
      setIsLoggedIn(session.isLoggedIn());
      setIsInitializing(false);
    });
  }, []);

  const handleDeleteReport = (reportId: number) => {
    Alert.alert('Delete Report', 'Are you sure you want to delete this report?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(`${API_BASE}/complaints/${reportId}`, {
              method: 'DELETE'
            });
            if (response.ok) {
              fetchComplaints();
            } else {
              Alert.alert('Error', 'Failed to delete report.');
            }
          } catch (error) {
            console.log('Error deleting report:', error);
            Alert.alert('Error', 'Failed to connect to backend.');
          }
        }
      }
    ]);
  };

  const handleSaveEdit = async () => {
    if (!editingReport) return;
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE}/complaints/${editingReport.complaint_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: editDescription })
      });
      if (response.ok) {
        setEditingReport(null);
        fetchComplaints();
      } else {
        Alert.alert('Error', 'Failed to update report.');
      }
    } catch (error) {
      console.log('Error updating report:', error);
      Alert.alert('Error', 'Failed to connect to backend.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Fetch complaints for the logged-in citizen from the backend
  const fetchComplaints = async () => {
    const user = session.getUser();
    if (!user) return;

    setFetchingReports(true);
    try {
      const response = await fetch(`${API_BASE}/complaints/citizen/${user.user_id}`);
      const result = await response.json();
      if (result.success && result.data) {
        setReports(result.data);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.log('Error fetching complaints from backend:', error);
      setReports([]);
    } finally {
      setFetchingReports(false);
    }
  };

  // Fetch notifications for the logged-in user
  const fetchNotifications = async () => {
    const user = session.getUser();
    if (!user) return;

    try {
      const response = await fetch(`${API_BASE}/notifications/${user.user_id}`);
      const result = await response.json();
      if (result.success && result.data) {
        setNotifications(result.data);
        setUnreadCount(result.data.filter((n: any) => n.status === 'Unread').length);
      }
    } catch (error) {
      console.log('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchComplaints();
      fetchNotifications();
    }
  }, [isLoggedIn]);

  const markNotificationRead = async (notification: any) => {
    if (notification.status === 'Read') return;
    try {
      const response = await fetch(`${API_BASE}/notifications/${notification.notification_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Read' })
      });
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.notification_id === notification.notification_id ? { ...n, status: 'Read' } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.log('Error marking notification read:', error);
    }
  };

  const markAllNotificationsRead = async () => {
    const unread = notifications.filter(n => n.status === 'Unread');
    if (unread.length === 0) return;

    try {
      await Promise.all(
        unread.map(n => 
          fetch(`${API_BASE}/notifications/${n.notification_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Read' })
          })
        )
      );
      setNotifications(prev => prev.map(n => ({ ...n, status: 'Read' })));
      setUnreadCount(0);
    } catch (error) {
      console.log('Error marking all notifications read:', error);
    }
  };

  // Handle Sign In (calls API /users/login)
  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const result = await response.json();
      if (response.ok && result.success) {
        session.setUser(result.data, rememberMe);
        setIsLoggedIn(true);
      } else {
        Alert.alert('Login Failed', result.message || 'Invalid email or password.');
      }
    } catch (error) {
      console.log('Connection error:', error);
      Alert.alert('Connection Error', `Failed to connect to backend at ${API_BASE}. Please ensure backend is running.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up (calls API /users/register)
  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Validation Error', 'Please fill in all the fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          password,
          role: 'Citizen',
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        Alert.alert('Registration Successful', 'Your account has been created. Please sign in.', [
          { text: 'OK', onPress: () => setIsSignUp(false) }
        ]);
      } else {
        Alert.alert('Registration Failed', result.message || 'Failed to create account.');
      }
    } catch (error) {
      console.log('Connection error:', error);
      Alert.alert('Connection Error', `Failed to connect to backend at ${API_BASE}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    session.logout();
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
  };

  // Helper to determine status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
      case 'completed':
        return '#00a86b';
      case 'in progress':
      case 'under review':
      case 'assigned':
        return '#ff6f32';
      case 'pending':
      default:
        return '#e8a900';
    }
  };

  // Helper to format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9ff' }}>
        <ActivityIndicator size="large" color="#00386c" />
      </View>
    );
  }

  // -------------------------------------------------------------
  // RENDER LOGGED IN DASHBOARD
  // -------------------------------------------------------------
  if (isLoggedIn) {
    const user = session.getUser();
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9ff" />
        <View style={styles.header}>
          <View style={styles.headerBranding}>
            <GovBuilding size={24} color="#00386c" />
            <Text style={styles.headerTitle}>CivicFlow</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.notificationButton} 
              activeOpacity={0.8}
              onPress={() => setShowNotifications(true)}
            >
              <BellIcon size={20} color="#00386c" />
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileIconButton} activeOpacity={0.8} onPress={() => router.push('/profile')}>
              <PersonIcon size={22} color="#00386c" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.dashboardScroll} 
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Banner */}
          <View style={styles.welcomeBanner}>
            <Text style={styles.welcomeText}>Hello, {user?.name || 'Citizen'}</Text>
            <Text style={styles.welcomeSubtitle}>Welcome to your civic dashboard. Here is your community overview.</Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderLeftColor: '#00386c' }]}>
              <Text style={styles.statNumber}>{reports.length}</Text>
              <Text style={styles.statLabel}>Total Filed</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#ff6f32' }]}>
              <Text style={[styles.statNumber, { color: '#ff6f32' }]}>
                {reports.filter(r => r.status?.toLowerCase() !== 'resolved').length}
              </Text>
              <Text style={styles.statLabel}>Pending / Review</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#00a86b' }]}>
              <Text style={[styles.statNumber, { color: '#00a86b' }]}>
                {reports.filter(r => r.status?.toLowerCase() === 'resolved').length}
              </Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>
          </View>

          {/* Action Callout */}
          <View style={styles.actionCallout}>
            <Text style={styles.calloutTitle}>Notice an issue in your area?</Text>
            <Text style={styles.calloutSubtitle}>Help the city council locate and resolve public issues faster.</Text>
            <TouchableOpacity
              style={styles.calloutButton}
              activeOpacity={0.9}
              onPress={() => router.push('/complaint')}
            >
              <Text style={styles.calloutButtonText}>Report New Issue</Text>
              <ArrowRight size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Recent Reports List */}
          <View style={styles.reportsSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>Recent Activity</Text>
              <TouchableOpacity onPress={fetchComplaints}>
                <Text style={styles.refreshText}>Refresh</Text>
              </TouchableOpacity>
            </View>

            {fetchingReports ? (
              <ActivityIndicator size="large" color="#00386c" style={{ marginTop: 20 }} />
            ) : reports.length === 0 ? (
              <View style={styles.emptyState}>
                <PlusIcon size={48} color="#c2c6d1" />
                <Text style={styles.emptyTitle}>No Reports Yet</Text>
                <Text style={styles.emptySubtitle}>
                  You haven't filed any civic reports. Tap "Report New Issue" to get started.
                </Text>
              </View>
            ) : (
              reports.map((report) => (
                <View key={report.complaint_id} style={styles.reportCard}>
                  <View style={styles.reportCardHeader}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={styles.reportTitle}>{report.title}</Text>
                      <Text style={styles.reportId}>ID: CF-{report.complaint_id}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 6 }}>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) + '15' }]}>
                        {report.status?.toLowerCase() === 'resolved' ? (
                          <CheckCircleIcon size={12} color="#00a86b" />
                        ) : (
                          <ClockIcon size={12} color={getStatusColor(report.status)} />
                        )}
                        <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
                          {report.status || 'Submitted'}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                        <TouchableOpacity onPress={() => { setEditingReport(report); setEditDescription(report.description); }} hitSlop={{top:10,bottom:10,left:10,right:10}}>
                          <EditIcon size={18} color="#00386c" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteReport(report.complaint_id)} hitSlop={{top:10,bottom:10,left:10,right:10}}>
                          <TrashIcon size={18} color="#ba1a1a" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {report.images && report.images.length > 0 && (
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: report.images[0].image_url }}
                        style={styles.reportImagePreview}
                        resizeMode="cover"
                        onError={() => console.log('Image failed to load:', report.images[0].image_url)}
                      />
                    </View>
                  )}

                  <Text style={styles.reportDescription}>{report.description}</Text>

                  <View style={styles.reportFooter}>
                    <View style={styles.footerItem}>
                      <MapPinIcon size={14} color="#737781" />
                      <Text style={styles.footerText} numberOfLines={1}>
                        {report.address || 'Location Unknown'}
                      </Text>
                    </View>
                    <Text style={styles.reportDate}>{formatDate(report.created_at)}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Reusable Bottom Navigation Bar */}
        <View style={styles.bottomTabBar}>
          <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/')}>
            <HomeIcon size={24} color="#00386c" />
            <Text style={[styles.tabLabel, styles.tabLabelActive]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/explore')}>
            <GlobeIcon size={24} color="#737781" />
            <Text style={styles.tabLabel}>Explore</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItemReport} onPress={() => router.push('/complaint')} activeOpacity={0.85}>
            <View style={styles.reportBadgeCircle}>
              <BoldPlusIcon size={28} color="#ffffff" />
            </View>
            <Text style={styles.reportTabLabel}>Report</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/maps')}>
            <MapIcon size={24} color="#737781" />
            <Text style={styles.tabLabel}>Maps</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/profile')}>
            <PersonIcon size={24} color="#737781" />
            <Text style={styles.tabLabel}>Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Edit Description Modal */}
        <Modal
          visible={!!editingReport}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setEditingReport(null)}
        >
          <View style={styles.editModalOverlay}>
            <View style={styles.editModalContent}>
              <Text style={styles.editModalTitle}>Edit Description</Text>
              <TextInput
                style={styles.editModalInput}
                multiline
                numberOfLines={4}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Enter new description"
              />
              <View style={styles.editModalActions}>
                <TouchableOpacity 
                  style={[styles.editModalButton, styles.editModalCancel]} 
                  onPress={() => setEditingReport(null)}
                  disabled={isUpdating}
                >
                  <Text style={styles.editModalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.editModalButton, styles.editModalSave]} 
                  onPress={handleSaveEdit}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.editModalSaveText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Notifications Modal */}
        <Modal
          visible={showNotifications}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowNotifications(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPressOut={() => setShowNotifications(false)}
          >
            <View style={styles.notificationPanel} onStartShouldSetResponder={() => true}>
              <View style={styles.dragIndicator} />
              <View style={styles.notificationPanelHeader}>
                <Text style={styles.notificationPanelTitle}>Notifications</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {unreadCount > 0 && (
                    <TouchableOpacity onPress={markAllNotificationsRead} style={styles.closeButton}>
                      <Text style={[styles.closeButtonText, { color: '#00386c' }]}>Mark all as read</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => setShowNotifications(false)} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <ScrollView contentContainerStyle={styles.notificationList} showsVerticalScrollIndicator={false}>
                {notifications.length === 0 ? (
                  <Text style={{ textAlign: 'center', color: '#737781', marginTop: 20 }}>No notifications yet.</Text>
                ) : (
                  notifications.map((notif) => (
                    <TouchableOpacity
                      key={notif.notification_id}
                      style={[
                        styles.notificationItem,
                        notif.status === 'Unread' && styles.notificationItemUnread
                      ]}
                      onPress={() => markNotificationRead(notif)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.notificationTitle}>{notif.title}</Text>
                      <Text style={styles.notificationMessage}>{notif.message}</Text>
                      <Text style={styles.notificationDate}>{formatDate(notif.created_at)}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // RENDER LOGIN / SIGN UP PAGE
  // -------------------------------------------------------------
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9ff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Abstract Floating Background Blobs */}
          <View style={styles.topBlob} />
          <View style={styles.bottomBlob} />

          <View style={styles.mainContainer}>
            {/* Branding Header */}
            <View style={styles.brandingContainer}>
              <View style={styles.logoBadge}>
                <GovBuilding size={28} color="#ffffff" />
              </View>
              <Text style={styles.brandTitle}>CivicFlow</Text>
              <Text style={styles.brandSlogan}>
                Empowering cities, <Text style={styles.sloganHighlight}>one report at a time.</Text>
              </Text>
            </View>

            {/* Authentication Card */}
            <View style={styles.authCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </Text>
                <Text style={styles.cardSubtitle}>
                  {isSignUp ? 'Join CivicFlow to report issues' : 'Sign in to your civic account'}
                </Text>
              </View>

              {/* Form Fields */}
              <View style={styles.form}>
                {isSignUp && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.fieldLabel}>Full Name</Text>
                    <View style={styles.inputWrapper}>
                      <View style={styles.inputIconWrapper}>
                        <PersonIcon size={20} color="#737781" />
                      </View>
                      <TextInput
                        style={styles.input}
                        placeholder="John Doe"
                        placeholderTextColor="#737781"
                        value={name}
                        onChangeText={setName}
                      />
                    </View>
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <Text style={styles.fieldLabel}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIconWrapper}>
                      <MailIcon size={20} color="#737781" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="name@city.gov"
                      placeholderTextColor="#737781"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.passwordLabelRow}>
                    <Text style={styles.fieldLabel}>Password</Text>
                    {!isSignUp && (
                      <TouchableOpacity>
                        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIconWrapper}>
                      <LockIcon size={20} color="#737781" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="#737781"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.visibilityButton}
                    >
                      {showPassword ? (
                        <VisibilityIcon size={20} color="#737781" />
                      ) : (
                        <VisibilityOffIcon size={20} color="#737781" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {isSignUp && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.fieldLabel}>Confirm Password</Text>
                    <View style={styles.inputWrapper}>
                      <View style={styles.inputIconWrapper}>
                        <LockIcon size={20} color="#737781" />
                      </View>
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="#737781"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                      />
                    </View>
                  </View>
                )}

                {/* Remember Me Option (Only on login) */}
                {!isSignUp && (
                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setRememberMe(!rememberMe)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                      {rememberMe && <View style={styles.checkboxInner} />}
                    </View>
                    <Text style={styles.checkboxLabel}>Remember me on this device</Text>
                  </TouchableOpacity>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.submitButton, loading && { backgroundColor: '#c2c6d1' }]}
                  onPress={isSignUp ? handleSignUp : handleSignIn}
                  disabled={loading}
                  activeOpacity={0.9}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>
                        {isSignUp ? 'Create Account' : 'Sign In'}
                      </Text>
                      <ArrowRight size={20} color="#ffffff" />
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Social Login Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Buttons */}
              <View style={styles.socialGrid}>
                <TouchableOpacity style={styles.socialButton} onPress={handleSignIn} activeOpacity={0.8}>
                  <GovIdIcon size={18} color="#0b1c30" />
                  <Text style={styles.socialButtonText}>Gov ID</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton} onPress={handleSignIn} activeOpacity={0.8}>
                  <FingerprintIcon size={18} color="#0b1c30" />
                  <Text style={styles.socialButtonText}>Biometrics</Text>
                </TouchableOpacity>
              </View>

              {/* Switch View Link */}
              <TouchableOpacity
                onPress={() => setIsSignUp(!isSignUp)}
                style={styles.switchContainer}
                activeOpacity={0.8}
              >
                <Text style={styles.switchText}>
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                  <Text style={styles.switchActionText}>
                    {isSignUp ? 'Sign In' : 'Create Account'}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  editModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00386c',
    marginBottom: 16,
  },
  editModalInput: {
    borderWidth: 1,
    borderColor: '#c2c6d1',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#0b1c30',
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  editModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  editModalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  editModalCancel: {
    backgroundColor: '#f0f4f8',
  },
  editModalSave: {
    backgroundColor: '#00386c',
  },
  editModalCancelText: {
    color: '#424750',
    fontWeight: '600',
  },
  editModalSaveText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  notificationPanel: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    minHeight: '50%',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 20,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#c2c6d1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  notificationPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  notificationPanelTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00386c',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#737781',
    fontWeight: '600',
    fontSize: 14,
  },
  notificationList: {
    paddingBottom: 20,
  },
  notificationItem: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9ff',
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#c2c6d1',
  },
  notificationItemUnread: {
    backgroundColor: '#e5eeff',
    borderLeftColor: '#00386c',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0b1c30',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#424750',
    marginBottom: 8,
  },
  notificationDate: {
    fontSize: 12,
    color: '#737781',
  },
  imageContainer: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#e5eeff',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportImagePreview: {
    width: '100%',
    height: '100%',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    position: 'relative',
  },
  topBlob: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#e5eeff',
    opacity: 0.6,
    zIndex: 0,
  },
  bottomBlob: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#d5e3ff',
    opacity: 0.4,
    zIndex: 0,
  },
  mainContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    zIndex: 10,
  },
  brandingContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    backgroundColor: '#00386c',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#00386c',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  brandSlogan: {
    fontSize: 15,
    color: '#424750',
    textAlign: 'center',
  },
  sloganHighlight: {
    color: '#00386c',
    fontWeight: '600',
  },
  authCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#0b1c30',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(194, 202, 209, 0.3)',
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0b1c30',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#424750',
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424750',
    marginLeft: 4,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#00386c',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c2c6d1',
    paddingHorizontal: 12,
    height: 48,
  },
  inputIconWrapper: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#0b1c30',
    fontSize: 14,
    height: '100%',
    padding: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
      },
    }),
  },
  visibilityButton: {
    padding: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginLeft: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#c2c6d1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxActive: {
    borderColor: '#00386c',
    backgroundColor: '#00386c',
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#424750',
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00386c',
    height: 52,
    borderRadius: 12,
    gap: 8,
    marginTop: 12,
    shadowColor: '#00386c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#c2c6d1',
    opacity: 0.5,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#737781',
    paddingHorizontal: 12,
    letterSpacing: 0.5,
  },
  socialGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c2c6d1',
    borderRadius: 12,
    height: 44,
    gap: 8,
  },
  socialButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0b1c30',
  },
  switchContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  switchText: {
    fontSize: 13,
    color: '#424750',
  },
  switchActionText: {
    color: '#a83900',
    fontWeight: '700',
  },

  // -------------------------------------------------------------
  // DASHBOARD STYLES
  // -------------------------------------------------------------
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#ba1a1a',
  },
  logoutText: {
    fontSize: 12,
    color: '#ba1a1a',
    fontWeight: '600',
  },
  notificationButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9ff',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#ba1a1a',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notifBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#424750',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#737781',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  dashboardScroll: {
    padding: 20,
    gap: 24,
  },
  welcomeBanner: {
    gap: 6,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0b1c30',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#424750',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#0b1c30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#00386c',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#737781',
    fontWeight: '500',
  },
  actionCallout: {
    backgroundColor: '#e5eeff',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 56, 108, 0.1)',
  },
  calloutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00386c',
  },
  calloutSubtitle: {
    fontSize: 13,
    color: '#424750',
    lineHeight: 18,
  },
  calloutButton: {
    flexDirection: 'row',
    backgroundColor: '#00386c',
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  calloutButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  reportsSection: {
    gap: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0b1c30',
  },
  refreshText: {
    fontSize: 13,
    color: '#00386c',
    fontWeight: '600',
  },
  reportCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#0b1c30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(194, 202, 209, 0.2)',
  },
  reportCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0b1c30',
  },
  reportId: {
    fontSize: 12,
    color: '#737781',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  reportDescription: {
    fontSize: 13,
    color: '#424750',
    lineHeight: 18,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f8f9ff',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginRight: 12,
  },
  footerText: {
    fontSize: 12,
    color: '#737781',
  },
  reportDate: {
    fontSize: 12,
    color: '#737781',
  },
  bottomTabBar: {
    height: 64,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eff4ff',
    paddingBottom: Platform.OS === 'ios' ? 12 : 0,
    overflow: 'visible',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  tabItemReport: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -24,
  },
  reportBadgeCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff3b30',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 7,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  reportBadgeCircleActive: {
    backgroundColor: '#d32f2f',
    shadowColor: '#d32f2f',
  },
  reportTabLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ff3b30',
    marginTop: 2,
  },
  reportTabLabelActive: {
    color: '#d32f2f',
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
  profileIconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9ff',
  },
});
