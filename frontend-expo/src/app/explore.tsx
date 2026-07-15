import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  GovBuilding,
  HomeIcon,
  PlusIcon,
  PersonIcon,
  MapPinIcon,
  GlobeIcon,
  SearchIcon,
  FilterIcon,
  ArrowUpIcon,
} from '../components/Icons';
import { API_BASE, session } from '../services/api';

export default function ExploreScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');

  const handleUpvote = async (reportId: number) => {
    const currentUser = session.getUser();
    if (!currentUser) return;
    
    // Find if already upvoted to toggle
    const report = reports.find(r => r.complaint_id === reportId);
    if (!report) return;
    
    const isUpvoted = report.has_upvoted;
    const upvoteChange = isUpvoted ? -1 : 1;

    try {
      // Optimistic update
      setReports(prev => prev.map(r => r.complaint_id === reportId ? { ...r, upvotes: Math.max(0, (r.upvotes || 0) + upvoteChange), has_upvoted: !isUpvoted } : r));
      const response = await fetch(`${API_BASE}/complaints/${reportId}/upvote?user_id=${currentUser.user_id}`, {
        method: 'POST'
      });
      if (!response.ok) {
        // Revert on failure
        setReports(prev => prev.map(r => r.complaint_id === reportId ? { ...r, upvotes: Math.max(0, (r.upvotes || 0) - upvoteChange), has_upvoted: isUpvoted } : r));
      }
    } catch (error) {
      console.log('Error upvoting:', error);
      // Revert on failure
      setReports(prev => prev.map(r => r.complaint_id === reportId ? { ...r, upvotes: Math.max(0, (r.upvotes || 0) - upvoteChange), has_upvoted: isUpvoted } : r));
    }
  };

  const fetchGlobalReports = async () => {
    try {
      const currentUser = session.getUser();
      const url = currentUser ? `${API_BASE}/complaints?user_id=${currentUser.user_id}` : `${API_BASE}/complaints`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.success && result.data) {
        setReports(result.data);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.log('Error fetching global reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGlobalReports();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGlobalReports();
  }, []);

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

  let filteredReports = reports.filter((report) => {
    // Search matching
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      report.title?.toLowerCase().includes(searchLower) ||
      report.description?.toLowerCase().includes(searchLower) ||
      report.address?.toLowerCase().includes(searchLower);
    
    // Status matching
    const matchesStatus = statusFilter === 'All' || report.status === statusFilter;
    
    // Category matching
    const matchesCategory = categoryFilter === 'All' || report.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (sortBy === 'Most Upvotes') {
    filteredReports.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
  } else {
    // Newest
    filteredReports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  const statuses = ['All', 'Pending', 'In Progress', 'Resolved'];
  const categories = ['All', 'Pothole', 'Leakage', 'Street Light', 'Waste'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9ff" />
      <View style={styles.header}>
        <View style={styles.headerBranding}>
          <GovBuilding size={24} color="#00386c" />
          <Text style={styles.headerTitle}>Global Feed</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <SearchIcon size={20} color="#737781" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reports..."
            placeholderTextColor="#737781"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filtersWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterScrollContent}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Status:</Text>
            {statuses.map(s => (
              <TouchableOpacity
                key={`status-${s}`}
                style={[styles.filterChip, statusFilter === s && styles.filterChipActive]}
                onPress={() => setStatusFilter(s)}
              >
                <Text style={[styles.filterChipText, statusFilter === s && styles.filterChipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.filterGroupSeparator} />
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Category:</Text>
            {categories.map(c => (
              <TouchableOpacity
                key={`cat-${c}`}
                style={[styles.filterChip, categoryFilter === c && styles.filterChipActive]}
                onPress={() => setCategoryFilter(c)}
              >
                <Text style={[styles.filterChipText, categoryFilter === c && styles.filterChipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.filterGroupSeparator} />
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Sort By:</Text>
            {['Newest', 'Most Upvotes'].map(s => (
              <TouchableOpacity
                key={`sort-${s}`}
                style={[styles.filterChip, sortBy === s && styles.filterChipActive]}
                onPress={() => setSortBy(s)}
              >
                <Text style={[styles.filterChipText, sortBy === s && styles.filterChipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView 
        contentContainerStyle={styles.feedScroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00386c']} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00386c" />
          </View>
        ) : filteredReports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No reports found</Text>
            <Text style={styles.emptyText}>Try adjusting your filters or search.</Text>
          </View>
        ) : (
          filteredReports.map((report) => (
            <View key={report.complaint_id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <View style={styles.reportHeaderLeft}>
                  <Text style={styles.reportCategory}>{report.category || 'General'}</Text>
                  <Text style={styles.reportDate}>{formatDate(report.created_at)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) + '1A' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
                    {report.status || 'Pending'}
                  </Text>
                </View>
              </View>

              <Text style={styles.reportTitle}>{report.title}</Text>
              <Text style={styles.reportDesc} numberOfLines={2}>{report.description}</Text>

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

              <View style={styles.reportFooter}>
                <View style={styles.locationWrapper}>
                  <MapPinIcon size={14} color="#737781" />
                  <Text style={styles.locationText} numberOfLines={1}>{report.address || 'Location not specified'}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={styles.citizenText}>Citizen #{report.citizen_id}</Text>
                  <TouchableOpacity 
                    style={[styles.upvoteButton, report.has_upvoted && styles.upvoteButtonActive]} 
                    onPress={() => handleUpvote(report.complaint_id)}
                    activeOpacity={0.7}
                  >
                    <ArrowUpIcon size={16} color={report.has_upvoted ? "#ffffff" : "#00386c"} />
                    <Text style={[styles.upvoteText, report.has_upvoted && styles.upvoteTextActive]}>{report.upvotes || 0}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Reusable Bottom Navigation Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/')}>
          <HomeIcon size={24} color="#737781" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/explore')}>
          <GlobeIcon size={24} color="#00386c" />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>Explore</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/complaint')}>
          <PlusIcon size={24} color="#737781" />
          <Text style={styles.tabLabel}>Report</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/profile')}>
          <PersonIcon size={24} color="#737781" />
          <Text style={styles.tabLabel}>Profile</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5eeff',
  },
  headerBranding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#00386c',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a1f36',
  },
  filtersWrapper: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5eeff',
    paddingBottom: 12,
  },
  filterScroll: {
    paddingHorizontal: 20,
  },
  filterScrollContent: {
    paddingRight: 40, // extra padding for scrolling
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#737781',
    marginRight: 4,
  },
  filterGroupSeparator: {
    width: 1,
    height: 24,
    backgroundColor: '#e5eeff',
    marginHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f4f8',
  },
  filterChipActive: {
    backgroundColor: '#00386c',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#424750',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  feedScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1f36',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#737781',
    marginTop: 8,
  },
  reportCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5eeff',
    shadowColor: '#00386c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportHeaderLeft: {
    flex: 1,
  },
  reportCategory: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00386c',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reportDate: {
    fontSize: 12,
    color: '#737781',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1f36',
    marginBottom: 8,
  },
  reportDesc: {
    fontSize: 14,
    color: '#424750',
    lineHeight: 20,
    marginBottom: 16,
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
  reportFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f4f8',
    paddingTop: 12,
  },
  locationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 13,
    color: '#737781',
    marginLeft: 4,
    flexShrink: 1,
  },
  citizenText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00386c',
  },
  upvoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0f4f8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  upvoteButtonActive: {
    backgroundColor: '#00386c',
  },
  upvoteText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00386c',
  },
  upvoteTextActive: {
    color: '#ffffff',
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e5eeff',
    paddingBottom: 8,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#737781',
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#00386c',
  },
});
