import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import {
  HomeIcon,
  PlusIcon,
  PersonIcon,
  GlobeIcon,
  MapIcon,
} from '../components/Icons';
import { API_BASE, session } from '../services/api';

export default function MapsScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Default region
  const [region, setRegion] = useState({
    latitude: 28.6139,
    longitude: 77.2090,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  const fetchGlobalReports = async () => {
    try {
      const currentUser = session.getUser();
      const url = currentUser ? `${API_BASE}/complaints?user_id=${currentUser.user_id}` : `${API_BASE}/complaints`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.success && result.data) {
        // Filter out reports without coordinates
        const mapReports = result.data.filter((r: any) => r.latitude && r.longitude);
        setReports(mapReports);
        
        // Optionally update region to center on the first report
        if (mapReports.length > 0) {
          setRegion({
            latitude: mapReports[0].latitude,
            longitude: mapReports[0].longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
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

  const leafletHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            body { padding: 0; margin: 0; }
            html, body, #map { height: 100%; width: 100vw; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map = L.map('map').setView([${region.latitude}, ${region.longitude}], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap'
            }).addTo(map);

            const reports = ${JSON.stringify(reports)};
            
            function getStatusColor(status) {
                status = status ? status.toLowerCase() : '';
                if (status === 'resolved' || status === 'completed') return '#00a86b';
                if (status === 'in progress' || status === 'under review' || status === 'assigned') return '#ff6f32';
                return '#e8a900';
            }

            reports.forEach(report => {
                const color = getStatusColor(report.status);
                
                const markerHtmlStyles = \`
                  background-color: \${color};
                  width: 1.5rem;
                  height: 1.5rem;
                  display: block;
                  left: -0.75rem;
                  top: -0.75rem;
                  position: relative;
                  border-radius: 1.5rem 1.5rem 0;
                  transform: rotate(45deg);
                  border: 1px solid #FFFFFF\`;

                const icon = L.divIcon({
                  className: "my-custom-pin",
                  iconAnchor: [0, 24],
                  labelAnchor: [-6, 0],
                  popupAnchor: [0, -36],
                  html: \`<span style="\${markerHtmlStyles}" />\`
                });

                const marker = L.marker([report.latitude, report.longitude], {icon: icon}).addTo(map);
                
                let popupContent = '<div style="width: 200px; font-family: sans-serif;">' +
                    '<h4 style="margin: 0 0 4px 0; font-size: 14px; color: #0b1c30;">' + report.title + '</h4>' +
                    '<strong style="font-size: 12px; color:' + color + ';">' + (report.status || 'Pending') + '</strong><br/>';
                    
                if (report.images && report.images.length > 0) {
                    popupContent += '<img src="' + report.images[0].image_url + '" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin: 8px 0;" /><br/>';
                }
                
                popupContent += '<span style="font-size: 12px; color: #737781;">' + report.address + '</span></div>';
                
                marker.bindPopup(popupContent);
            });
        </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby Issues Map</Text>
        <Text style={styles.headerSubtitle}>Explore complaints in your area</Text>
      </View>

      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00386c" />
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

      {/* Reusable Bottom Navigation Bar */}
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#f8f9ff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0b1c30',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#737781',
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calloutContainer: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0b1c30',
    marginBottom: 4,
  },
  calloutStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  calloutImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  calloutAddress: {
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
