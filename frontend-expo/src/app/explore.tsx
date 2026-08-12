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
  Share,
  Modal,
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
  ShareIcon,
  MapIcon,
  ChevronDownIcon,
  CheckIcon,
  CloseIcon,
  BoldPlusIcon,
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
  const [activeModal, setActiveModal] = useState<'status' | 'category' | 'sort' | null>(null);


  const handleShare = async (report: any) => {
    try {
      const message = `Check out this issue on Smart Civic Platform:\n\n${report.title}\nLocation: ${report.address || 'Not specified'}\nStatus: ${report.status || 'Pending'}\n\nDownload the app to upvote and track it!`;
      const result = await Share.share({
        message,
        title: report.title,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: any) {
      console.log('Error sharing:', error.message);
    }
  };

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

  const hasActiveFilters = statusFilter !== 'All' || categoryFilter !== 'All' || sortBy !== 'Newest';
  const resetFilters = () => {
    setStatusFilter('All');
    setCategoryFilter('All');
    setSortBy('Newest');
  };

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
        <View style={styles.filterRow}>
          {/* Status Dropdown */}
          <TouchableOpacity
            style={[styles.dropdownButton, statusFilter !== 'All' && styles.dropdownButtonActive]}
            onPress={() => setActiveModal('status')}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownLabel}>Status</Text>
            <View style={styles.dropdownValueRow}>
              <Text style={[styles.dropdownValueText, statusFilter !== 'All' && styles.dropdownValueTextActive]} numberOfLines={1}>
                {statusFilter}
              </Text>
              <ChevronDownIcon size={14} color={statusFilter !== 'All' ? '#00386c' : '#737781'} />
            </View>
          </TouchableOpacity>

          {/* Category Dropdown */}
          <TouchableOpacity
            style={[styles.dropdownButton, categoryFilter !== 'All' && styles.dropdownButtonActive]}
            onPress={() => setActiveModal('category')}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownLabel}>Category</Text>
            <View style={styles.dropdownValueRow}>
              <Text style={[styles.dropdownValueText, categoryFilter !== 'All' && styles.dropdownValueTextActive]} numberOfLines={1}>
                {categoryFilter}
              </Text>
              <ChevronDownIcon size={14} color={categoryFilter !== 'All' ? '#00386c' : '#737781'} />
            </View>
          </TouchableOpacity>

          {/* Sort By Dropdown */}
          <TouchableOpacity
            style={[styles.dropdownButton, sortBy !== 'Newest' && styles.dropdownButtonActive]}
            onPress={() => setActiveModal('sort')}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownLabel}>Sort By</Text>
            <View style={styles.dropdownValueRow}>
              <Text style={[styles.dropdownValueText, sortBy !== 'Newest' && styles.dropdownValueTextActive]} numberOfLines={1}>
                {sortBy}
              </Text>
              <ChevronDownIcon size={14} color={sortBy !== 'Newest' ? '#00386c' : '#737781'} />
            </View>
          </TouchableOpacity>
        </View>

        {hasActiveFilters && (
          <TouchableOpacity style={styles.resetButton} onPress={resetFilters} activeOpacity={0.7}>
            <CloseIcon size={12} color="#00386c" />
            <Text style={styles.resetButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        )}
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
                    style={styles.shareButton} 
                    onPress={() => handleShare(report)}
                    activeOpacity={0.7}
                  >
                    <ShareIcon size={16} color="#00386c" />
                  </TouchableOpacity>
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

      {/* Dropdown Options Modal Sheet */}
      <Modal
        visible={activeModal !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveModal(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActiveModal(null)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <FilterIcon size={18} color="#00386c" />
                <Text style={styles.modalTitle}>
                  {activeModal === 'status' && 'Filter by Status'}
                  {activeModal === 'category' && 'Filter by Category'}
                  {activeModal === 'sort' && 'Sort Reports By'}
                </Text>
              </View>
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setActiveModal(null)}>
                <CloseIcon size={20} color="#737781" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalOptionsList} bounces={false}>
              {activeModal === 'status' && statuses.map(s => {
                const isSelected = statusFilter === s;
                return (
                  <TouchableOpacity
                    key={`opt-status-${s}`}
                    style={[styles.modalOptionItem, isSelected && styles.modalOptionItemSelected]}
                    onPress={() => {
                      setStatusFilter(s);
                      setActiveModal(null);
                    }}
                  >
                    <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]}>
                      {s}
                    </Text>
                    {isSelected && <CheckIcon size={18} color="#00386c" />}
                  </TouchableOpacity>
                );
              })}

              {activeModal === 'category' && categories.map(c => {
                const isSelected = categoryFilter === c;
                return (
                  <TouchableOpacity
                    key={`opt-cat-${c}`}
                    style={[styles.modalOptionItem, isSelected && styles.modalOptionItemSelected]}
                    onPress={() => {
                      setCategoryFilter(c);
                      setActiveModal(null);
                    }}
                  >
                    <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]}>
                      {c}
                    </Text>
                    {isSelected && <CheckIcon size={18} color="#00386c" />}
                  </TouchableOpacity>
                );
              })}

              {activeModal === 'sort' && ['Newest', 'Most Upvotes'].map(s => {
                const isSelected = sortBy === s;
                return (
                  <TouchableOpacity
                    key={`opt-sort-${s}`}
                    style={[styles.modalOptionItem, isSelected && styles.modalOptionItemSelected]}
                    onPress={() => {
                      setSortBy(s);
                      setActiveModal(null);
                    }}
                  >
                    <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]}>
                      {s}
                    </Text>
                    {isSelected && <CheckIcon size={18} color="#00386c" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownButton: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5eeff',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dropdownButtonActive: {
    backgroundColor: '#eef5fc',
    borderColor: '#00386c',
  },
  dropdownLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#737781',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  dropdownValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownValueText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1f36',
    flex: 1,
    marginRight: 4,
  },
  dropdownValueTextActive: {
    color: '#00386c',
    fontWeight: '700',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#eef5fc',
  },
  resetButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00386c',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4f8',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#00386c',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalOptionsList: {
    paddingTop: 12,
  },
  modalOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 3,
  },
  modalOptionItemSelected: {
    backgroundColor: '#eef5fc',
  },
  modalOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#424750',
  },
  modalOptionTextSelected: {
    fontWeight: '700',
    color: '#00386c',
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
  shareButton: {
    padding: 6,
    backgroundColor: '#f0f4f8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
    overflow: 'visible',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
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
    fontSize: 10,
    fontWeight: '600',
    color: '#737781',
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#00386c',
  },
});
