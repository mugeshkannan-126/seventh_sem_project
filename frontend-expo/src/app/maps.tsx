import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import {
  HomeIcon,
  PlusIcon,
  PersonIcon,
  GlobeIcon,
  MapIcon,
  SearchIcon,
  FilterIcon,
  ArrowUpIcon,
  CloseIcon,
  ListIcon,
  InfoIcon,
} from '../components/Icons';
import { API_BASE, session } from '../services/api';

// Category color definition table
const CATEGORY_COLORS: Record<string, { color: string; label: string; icon: string }> = {
  'Pothole': { color: '#e63946', label: 'Pothole & Roads', icon: '🛣️' },
  'Leakage': { color: '#0077b6', label: 'Water & Sewage', icon: '💧' },
  'Street Light': { color: '#f7b801', label: 'Street Light & Electric', icon: '💡' },
  'Waste': { color: '#2a9d8f', label: 'Waste & Garbage', icon: '🗑️' },
  'Traffic Sign': { color: '#9d4edd', label: 'Traffic & Signage', icon: '🚦' },
  'Park/Public Property': { color: '#2b9348', label: 'Parks & Property', icon: '🌳' },
  'Other': { color: '#6c757d', label: 'Other / General', icon: '📍' },
};

function getCategoryColor(category: string): string {
  if (!category) return '#6c757d';
  const catLower = category.toLowerCase().trim();
  if (catLower.includes('pothole') || catLower.includes('road')) return '#e63946';
  if (catLower.includes('leak') || catLower.includes('water') || catLower.includes('drain')) return '#0077b6';
  if (catLower.includes('light') || catLower.includes('lamp') || catLower.includes('electric')) return '#f7b801';
  if (catLower.includes('waste') || catLower.includes('garbage') || catLower.includes('trash')) return '#2a9d8f';
  if (catLower.includes('traffic') || catLower.includes('sign')) return '#9d4edd';
  if (catLower.includes('park') || catLower.includes('tree') || catLower.includes('property')) return '#2b9348';
  return '#6c757d';
}

function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'resolved':
    case 'completed':
    case 'closed':
      return '#00a86b';
    case 'in progress':
    case 'under review':
    case 'assigned':
    case 'verified':
      return '#ff6f32';
    case 'submitted':
    case 'pending':
    default:
      return '#e8a900';
  }
}

export default function MapsScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState<'Newest' | 'Oldest' | 'Most Upvotes' | 'Priority'>('Newest');
  const [colorByMode, setColorByMode] = useState<'Category' | 'Status'>('Category');
  
  // UI Toggles
  const [showLegendModal, setShowLegendModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  // Region state
  const [region, setRegion] = useState({
    latitude: 28.6139,
    longitude: 77.2090,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  });

  const fetchGlobalReports = async () => {
    try {
      const currentUser = session.getUser();
      const url = currentUser ? `${API_BASE}/complaints?user_id=${currentUser.user_id}` : `${API_BASE}/complaints`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.success && result.data) {
        const mapReports = result.data.filter((r: any) => r.latitude && r.longitude);
        setReports(mapReports);
        
        if (mapReports.length > 0) {
          setRegion({
            latitude: Number(mapReports[0].latitude),
            longitude: Number(mapReports[0].longitude),
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          });
        }
      } else {
        setReports([]);
      }
    } catch (error) {
      console.log('Error fetching reports for map:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalReports();
  }, []);

  // Filter & Sort Logic
  const filteredAndSortedReports = useMemo(() => {
    let result = reports.filter((r) => {
      // Search text match
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        r.title?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.address?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q);

      // Category match
      const catMatch = selectedCategory === 'All' || 
        (r.category && r.category.toLowerCase().includes(selectedCategory.toLowerCase()));

      // Status match
      let statusMatch = true;
      if (selectedStatus !== 'All') {
        const s = (r.status || 'Pending').toLowerCase();
        if (selectedStatus === 'Pending') statusMatch = s === 'pending' || s === 'submitted';
        else if (selectedStatus === 'In Progress') statusMatch = s === 'in progress' || s === 'under review' || s === 'assigned' || s === 'verified';
        else if (selectedStatus === 'Resolved') statusMatch = s === 'resolved' || s === 'completed' || s === 'closed';
      }

      return matchesQuery && catMatch && statusMatch;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'Oldest') {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      } else if (sortBy === 'Most Upvotes') {
        return (b.upvotes || 0) - (a.upvotes || 0);
      } else if (sortBy === 'Priority') {
        const priorityScore: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
        const scoreA = priorityScore[a.priority] || 0;
        const scoreB = priorityScore[b.priority] || 0;
        return scoreB - scoreA;
      } else {
        // Newest
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    });

    return result;
  }, [reports, searchQuery, selectedCategory, selectedStatus, sortBy]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: reports.length };
    reports.forEach((r) => {
      const cat = r.category || 'Other';
      let mappedCat = 'Other';
      if (cat.toLowerCase().includes('pothole') || cat.toLowerCase().includes('road')) mappedCat = 'Pothole';
      else if (cat.toLowerCase().includes('leak') || cat.toLowerCase().includes('water')) mappedCat = 'Leakage';
      else if (cat.toLowerCase().includes('light') || cat.toLowerCase().includes('lamp')) mappedCat = 'Street Light';
      else if (cat.toLowerCase().includes('waste') || cat.toLowerCase().includes('garbage')) mappedCat = 'Waste';

      counts[mappedCat] = (counts[mappedCat] || 0) + 1;
    });
    return counts;
  }, [reports]);

  // Handle focusing map on an issue card selection
  const handleSelectReport = (report: any) => {
    setSelectedReportId(report.complaint_id);
    if (report.latitude && report.longitude) {
      setRegion({
        latitude: Number(report.latitude),
        longitude: Number(report.longitude),
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const leafletHtml = useMemo(() => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            body { padding: 0; margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
            html, body, #map { height: 100%; width: 100vw; }
            
            .custom-pin-container {
              display: flex;
              align-items: center;
              justify-content: center;
              background: transparent;
              border: none;
            }
            .leaflet-popup-content-wrapper {
              border-radius: 16px;
              padding: 4px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.18);
            }
            .popup-card {
              width: 220px;
              box-sizing: border-box;
            }
            .popup-img {
              width: 100%;
              height: 110px;
              object-fit: cover;
              border-radius: 12px;
              margin-bottom: 8px;
            }
            .popup-title {
              font-weight: 700;
              font-size: 15px;
              color: #0b1c30;
              margin: 0 0 6px 0;
              line-height: 1.3;
            }
            .popup-meta-row {
              display: flex;
              gap: 6px;
              align-items: center;
              margin-bottom: 6px;
              flex-wrap: wrap;
            }
            .badge-chip {
              font-size: 11px;
              font-weight: 700;
              padding: 3px 8px;
              border-radius: 12px;
              color: white;
              display: inline-block;
            }
            .popup-address {
              font-size: 12px;
              color: #64748b;
              margin-top: 4px;
              display: block;
            }
            .popup-date {
              font-size: 11px;
              color: #94a3b8;
              margin-top: 4px;
              display: block;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map = L.map('map', { zoomControl: false }).setView([${region.latitude}, ${region.longitude}], 13);
            L.control.zoom({ position: 'bottomright' }).addTo(map);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap'
            }).addTo(map);

            const reports = ${JSON.stringify(filteredAndSortedReports)};
            const colorByMode = "${colorByMode}";
            const selectedId = ${selectedReportId || 'null'};

            function getCatColor(cat) {
              if (!cat) return '#6c757d';
              const c = cat.toLowerCase();
              if (c.includes('pothole') || c.includes('road')) return '#e63946';
              if (c.includes('leak') || c.includes('water')) return '#0077b6';
              if (c.includes('light') || c.includes('lamp')) return '#f7b801';
              if (c.includes('waste') || c.includes('garbage')) return '#2a9d8f';
              if (c.includes('traffic') || c.includes('sign')) return '#9d4edd';
              if (c.includes('park') || c.includes('tree')) return '#2b9348';
              return '#6c757d';
            }

            function getCatInitial(cat) {
              if (!cat) return '📍';
              const c = cat.toLowerCase();
              if (c.includes('pothole') || c.includes('road')) return 'P';
              if (c.includes('leak') || c.includes('water')) return 'L';
              if (c.includes('light') || c.includes('lamp')) return 'S';
              if (c.includes('waste') || c.includes('garbage')) return 'W';
              if (c.includes('traffic') || c.includes('sign')) return 'T';
              if (c.includes('park') || c.includes('tree')) return 'K';
              return cat.substring(0, 1).toUpperCase();
            }

            function getStatColor(status) {
              status = status ? status.toLowerCase() : '';
              if (status === 'resolved' || status === 'completed' || status === 'closed') return '#00a86b';
              if (status === 'in progress' || status === 'under review' || status === 'assigned') return '#ff6f32';
              return '#e8a900';
            }

            reports.forEach(report => {
                const catColor = getCatColor(report.category);
                const statColor = getStatColor(report.status);
                const mainColor = colorByMode === 'Category' ? catColor : statColor;
                const isSelected = selectedId === report.complaint_id;
                const initial = getCatInitial(report.category);

                const w = isSelected ? 42 : 32;
                const h = isSelected ? 52 : 40;
                const anchorX = w / 2;
                const anchorY = h;

                const svgPin = \`
                  <svg width="\${w}" height="\${h}" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 3px 6px rgba(0,0,0,0.35)); transition: all 0.2s ease;">
                    <path d="M16 1C7.71573 1 1 7.71573 1 16C1 26.5 16 39 16 39C16 39 31 26.5 31 16C31 7.71573 24.2843 1 16 1Z" fill="\${mainColor}" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round"/>
                    <circle cx="16" cy="15" r="8.5" fill="#FFFFFF"/>
                    <text x="16" y="19.5" font-size="11" font-weight="900" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" fill="\${mainColor}" text-anchor="middle">\${initial}</text>
                  </svg>
                \`;

                const icon = L.divIcon({
                  className: "custom-pin-container",
                  iconSize: [w, h],
                  iconAnchor: [anchorX, anchorY],
                  popupAnchor: [0, -anchorY + 4],
                  html: svgPin
                });

                const marker = L.marker([report.latitude, report.longitude], {icon: icon}).addTo(map);

                
                let imgHtml = '';
                if (report.images && report.images.length > 0) {
                    imgHtml = \`<img class="popup-img" src="\${report.images[0].image_url}" />\`;
                }

                const catName = report.category || 'General';
                const statusName = report.status || 'Pending';
                
                let popupContent = \`
                  <div class="popup-card">
                    \${imgHtml}
                    <h4 class="popup-title">\${report.title}</h4>
                    <div class="popup-meta-row">
                      <span class="badge-chip" style="background-color: \${catColor};">\${catName}</span>
                      <span class="badge-chip" style="background-color: \${statColor};">\${statusName}</span>
                    </div>
                    \${report.address ? \`<span class="popup-address">📍 \${report.address}</span>\` : ''}
                    <span class="popup-date">📅 \${new Date(report.created_at).toLocaleDateString()} • 👍 \${report.upvotes || 0} Upvotes</span>
                  </div>
                \`;
                
                marker.bindPopup(popupContent);

                if (isSelected) {
                  marker.openPopup();
                }
            });
        </script>
    </body>
    </html>
    `;
  }, [filteredAndSortedReports, region, colorByMode, selectedReportId]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.headerTitle}>Interactive Map</Text>
            <Text style={styles.headerSubtitle}>
              {filteredAndSortedReports.length} {filteredAndSortedReports.length === 1 ? 'issue' : 'issues'} found on map
            </Text>
          </View>

          <View style={styles.headerActions}>
            {/* Color Legend Button */}
            <TouchableOpacity
              style={styles.actionIconButton}
              onPress={() => setShowLegendModal(true)}
              activeOpacity={0.7}
            >
              <InfoIcon size={20} color="#00386c" />
            </TouchableOpacity>

            {/* List Drawer Toggle Button */}
            <TouchableOpacity
              style={[styles.actionIconButton, showDrawer && styles.actionIconButtonActive]}
              onPress={() => setShowDrawer(!showDrawer)}
              activeOpacity={0.7}
            >
              <ListIcon size={20} color={showDrawer ? '#ffffff' : '#00386c'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <SearchIcon size={18} color="#737781" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search map issues by title or address..."
            placeholderTextColor="#737781"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <CloseIcon size={18} color="#737781" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Color Mode Switcher */}
        <View style={styles.modeSwitchRow}>
          <Text style={styles.modeLabel}>Color Pins By:</Text>
          <View style={styles.toggleGroup}>
            <TouchableOpacity
              style={[styles.toggleBtn, colorByMode === 'Category' && styles.toggleBtnActive]}
              onPress={() => setColorByMode('Category')}
            >
              <Text style={[styles.toggleText, colorByMode === 'Category' && styles.toggleTextActive]}>
                🎨 Category
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, colorByMode === 'Status' && styles.toggleBtnActive]}
              onPress={() => setColorByMode('Status')}
            >
              <Text style={[styles.toggleText, colorByMode === 'Status' && styles.toggleTextActive]}>
                ⚡ Status
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Horizontal Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryChipsScroll}
        >
          {['All', 'Pothole', 'Leakage', 'Street Light', 'Waste', 'Other'].map((cat) => {
            const isSelected = selectedCategory === cat;
            const catColor = cat === 'All' ? '#00386c' : getCategoryColor(cat);
            const count = categoryCounts[cat] || 0;

            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.chip,
                  isSelected && { backgroundColor: catColor, borderColor: catColor },
                ]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.chipDot,
                    { backgroundColor: isSelected ? '#ffffff' : catColor },
                  ]}
                />
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {cat}
                </Text>
                <View
                  style={[
                    styles.countBadge,
                    isSelected ? { backgroundColor: 'rgba(255,255,255,0.25)' } : { backgroundColor: '#e5eeff' },
                  ]}
                >
                  <Text style={[styles.countText, isSelected && { color: '#ffffff' }]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Status Filter & Sort Row */}
        <View style={styles.subFilterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
            {['All', 'Pending', 'In Progress', 'Resolved'].map((stat) => {
              const isSelected = selectedStatus === stat;
              return (
                <TouchableOpacity
                  key={stat}
                  style={[styles.subFilterChip, isSelected && styles.subFilterChipActive]}
                  onPress={() => setSelectedStatus(stat)}
                >
                  <Text style={[styles.subFilterText, isSelected && styles.subFilterTextActive]}>
                    {stat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Sort Selector */}
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => {
              const options: Array<'Newest' | 'Oldest' | 'Most Upvotes' | 'Priority'> = ['Newest', 'Oldest', 'Most Upvotes', 'Priority'];
              const nextIndex = (options.indexOf(sortBy) + 1) % options.length;
              setSortBy(options[nextIndex]);
            }}
          >
            <FilterIcon size={14} color="#00386c" />
            <Text style={styles.sortText}>Sort: {sortBy}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Map Container */}
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00386c" />
            <Text style={styles.loadingText}>Loading Map Data...</Text>
          </View>
        ) : Platform.OS === 'web' ? (
          <iframe
            title="OpenStreetMap"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            srcDoc={leafletHtml}
          />
        ) : (
          <WebView
            source={{ html: leafletHtml }}
            style={styles.map}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        )}
      </View>

      {/* Expandable Issue Drawer */}
      {showDrawer && (
        <View style={styles.drawerContainer}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>
              Filtered Issues ({filteredAndSortedReports.length})
            </Text>
            <TouchableOpacity onPress={() => setShowDrawer(false)}>
              <CloseIcon size={20} color="#737781" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.drawerList} nestedScrollEnabled>
            {filteredAndSortedReports.length === 0 ? (
              <View style={styles.emptyDrawer}>
                <Text style={styles.emptyText}>No issues match your selected filters.</Text>
              </View>
            ) : (
              filteredAndSortedReports.map((item) => {
                const isSelected = selectedReportId === item.complaint_id;
                const catColor = getCategoryColor(item.category);
                const statColor = getStatusColor(item.status);

                return (
                  <TouchableOpacity
                    key={item.complaint_id}
                    style={[styles.issueCard, isSelected && styles.issueCardSelected]}
                    onPress={() => handleSelectReport(item)}
                    activeOpacity={0.8}
                  >
                    {item.images && item.images.length > 0 ? (
                      <Image source={{ uri: item.images[0].image_url }} style={styles.issueImage} />
                    ) : (
                      <View style={[styles.issueImagePlaceholder, { backgroundColor: catColor + '20' }]}>
                        <Text style={{ fontSize: 20 }}>{item.category?.substring(0, 1) || '📍'}</Text>
                      </View>
                    )}

                    <View style={styles.issueContent}>
                      <View style={styles.badgeRow}>
                        <View style={[styles.pillBadge, { backgroundColor: catColor }]}>
                          <Text style={styles.pillText}>{item.category || 'General'}</Text>
                        </View>
                        <View style={[styles.pillBadge, { backgroundColor: statColor }]}>
                          <Text style={styles.pillText}>{item.status || 'Pending'}</Text>
                        </View>
                      </View>

                      <Text style={styles.issueTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.issueAddress} numberOfLines={1}>
                        📍 {item.address || 'Location provided'}
                      </Text>

                      <View style={styles.issueFooter}>
                        <Text style={styles.issueDate}>📅 {formatDate(item.created_at)}</Text>
                        <View style={styles.upvoteRow}>
                          <ArrowUpIcon size={12} color="#00386c" />
                          <Text style={styles.upvoteText}>{item.upvotes || 0}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      )}

      {/* Category Legend Modal */}
      <Modal
        visible={showLegendModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLegendModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🎨 Category Color Legend</Text>
              <TouchableOpacity onPress={() => setShowLegendModal(false)}>
                <CloseIcon size={22} color="#0b1c30" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Each type of civic complaint is highlighted on the map with a unique color tag:
            </Text>

            <View style={styles.legendList}>
              {Object.entries(CATEGORY_COLORS).map(([key, config]) => (
                <View key={key} style={styles.legendItem}>
                  <View style={[styles.legendColorBox, { backgroundColor: config.color }]}>
                    <Text style={styles.legendIcon}>{config.icon}</Text>
                  </View>
                  <View style={styles.legendTextCol}>
                    <Text style={styles.legendLabel}>{config.label}</Text>
                    <Text style={styles.legendCatName}>{key}</Text>
                  </View>
                  <View style={styles.legendCountBadge}>
                    <Text style={styles.legendCountText}>{categoryCounts[key] || 0} pins</Text>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowLegendModal(false)}
            >
              <Text style={styles.modalCloseBtnText}>Close Legend</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/')}>
          <HomeIcon size={24} color="#737781" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/explore')}>
          <GlobeIcon size={24} color="#737781" />
          <Text style={styles.tabLabel}>Explore</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/complaint')}>
          <PlusIcon size={24} color="#737781" />
          <Text style={styles.tabLabel}>Report</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/maps')}>
          <MapIcon size={24} color="#00386c" />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>Maps</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5eeff',
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0b1c30',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#737781',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f4fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconButtonActive: {
    backgroundColor: '#00386c',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4fb',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 38,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#0b1c30',
  },
  modeSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0b1c30',
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#f0f4fb',
    borderRadius: 16,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  toggleBtnActive: {
    backgroundColor: '#00386c',
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#737781',
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  categoryChipsScroll: {
    gap: 6,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  countBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00386c',
  },
  subFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 8,
  },
  subFilterChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 4,
    backgroundColor: '#f1f5f9',
  },
  subFilterChipActive: {
    backgroundColor: '#00386c',
  },
  subFilterText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
  },
  subFilterTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e5eeff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sortText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00386c',
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#737781',
    fontWeight: '500',
  },
  drawerContainer: {
    height: 220,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  drawerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0b1c30',
  },
  drawerList: {
    flex: 1,
  },
  emptyDrawer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  issueCard: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  issueCardSelected: {
    borderColor: '#00386c',
    backgroundColor: '#edf4ff',
  },
  issueImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  issueImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  issueContent: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 2,
  },
  pillBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  pillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
  },
  issueTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  issueAddress: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  issueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
  },
  issueDate: {
    fontSize: 10,
    color: '#94a3b8',
  },
  upvoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  upvoteText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00386c',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0b1c30',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
  },
  legendList: {
    gap: 10,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendColorBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendIcon: {
    fontSize: 14,
  },
  legendTextCol: {
    flex: 1,
  },
  legendLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  legendCatName: {
    fontSize: 11,
    color: '#94a3b8',
  },
  legendCountBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  legendCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  modalCloseBtn: {
    backgroundColor: '#00386c',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  bottomTabBar: {
    height: 64,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5eeff',
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

