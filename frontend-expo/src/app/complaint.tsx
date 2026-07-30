import React, { useState } from 'react';
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
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { File } from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../utils/supabase';
import {
  GovBuilding,
  MapPinIcon,
  CameraIcon,
  CheckCircleIcon,
  InfoIcon,
  ArrowRight,
  PotholeIcon,
  LeakageIcon,
  LightbulbIcon,
  TrashIcon,
  HomeIcon,
  PersonIcon,
  PlusIcon,
  GlobeIcon,
  MapIcon,
} from '../components/Icons';
import { API_BASE, session } from '../services/api';

export default function ComplaintScreen() {
  const router = useRouter();
  const [category, setCategory] = useState('Pothole');
  const [location, setLocation] = useState('420 Park Ave South, Manhattan');
  const [description, setDescription] = useState('');
  
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState<number | null>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  // Initialize with empty location until fetched
  React.useEffect(() => {
    setLocation('');
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    setGettingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to pinpoint the issue automatically.');
        setGettingLocation(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);
      
      // Reverse geocode to get address
      let geocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      
      if (geocode && geocode.length > 0) {
        const place = geocode[0];
        const streetInfo = [place.streetNumber, place.street].filter(Boolean).join(' ') || place.name;
        const addressStr = [
          streetInfo,
          place.city || place.subregion,
          place.region || place.country
        ].filter(Boolean).join(', ');
        setLocation(addressStr);
      } else {
        setLocation(`${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
      }
    } catch (error) {
      console.log('Error fetching location:', error);
      Alert.alert('Location Error', 'Failed to fetch current location. Please enter manually.');
    } finally {
      setGettingLocation(false);
    }
  };

  const pickImage = () => {
    Alert.alert('Upload Photo', 'Choose an option', [
      { text: 'Camera', onPress: launchCamera },
      { text: 'Gallery', onPress: launchGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const launchCamera = async () => {
    let { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
      return;
    }
    
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });
    handleImageResult(result);
  };

  const launchGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });
    handleImageResult(result);
  };

  const handleImageResult = (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const uri = asset.uri;
      const fileName = uri.split('/').pop() || 'photo.jpg';
      setImageFileName(fileName);
      uploadImage(uri, fileName, asset.base64);
      if (asset.base64) {
        analyzeImage(asset.base64);
      }
    }
  };

  const analyzeImage = async (base64Data: string) => {
    setIsAnalyzing(true);
    try {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AQ.Ab8RN6Ke6RBI-W89tiE6XoxFeC2BxLt-AxZBtyyEPauZa-lFGw';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;
      const actualBase64 = base64Data.includes('base64,') ? base64Data.split('base64,')[1] : base64Data;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "You are a Civic Flow app assistant. Analyze this image of a civic issue. Provide a short description (1-2 sentences) of the issue shown. Then classify it into one of these exact categories: 'Pothole', 'Leakage', 'Street Light', 'Waste', 'Other'. Return the result strictly as a JSON object with keys 'description' and 'category'."
                },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: actualBase64
                  }
                }
              ]
            }
          ]
        })
      });
      const result = await response.json();
      
      if (!response.ok || result.error) {
         console.warn('Gemini API Error:', result.error?.message || 'Unknown error');
         // Provide a fallback for demo purposes if API key is invalid
         setDescription('Automated description: A public issue captured by the user.');
         setCategory('Other');
         setCustomCategory('General Issue');
      } else if (result.candidates && result.candidates[0].content.parts[0].text) {
        let text = result.candidates[0].content.parts[0].text;
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(text);
        if (parsed.description) setDescription(parsed.description);
        if (parsed.category && ['Pothole', 'Leakage', 'Street Light', 'Waste', 'Other'].includes(parsed.category)) {
          setCategory(parsed.category);
        } else if (parsed.category) {
          setCategory('Other');
          setCustomCategory(parsed.category);
        }
      }
    } catch (error) {
      console.log('Error analyzing image:', error);
      // Fallback
      setDescription('Automated description: A public issue captured by the user.');
      setCategory('Other');
      setCustomCategory('General Issue');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const uploadImage = async (uri: string, fileName: string, base64Data?: string | null) => {
    setIsUploadingImage(true);
    try {
      const filePath = `${Date.now()}_${fileName}`;

      let data, error;

      if (Platform.OS === 'web') {
        const res = await fetch(uri);
        const fileData = await res.blob();
        
        const result = await supabase.storage
          .from('complaint-images')
          .upload(filePath, fileData, {
            contentType: 'image/jpeg',
            upsert: false,
          });
        data = result.data;
        error = result.error;
      } else {
        // React Native: Upload using base64-arraybuffer decode to avoid FormData issues
        if (!base64Data) {
          throw new Error('Image data is missing');
        }
        const result = await supabase.storage
          .from('complaint-images')
          .upload(filePath, decode(base64Data), {
            contentType: 'image/jpeg',
            upsert: false,
          });
        data = result.data;
        error = result.error;
      }

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('complaint-images')
        .getPublicUrl(filePath);

      setUploadedImageUrl(publicUrlData.publicUrl);
      setPhotoUploaded(true);
    } catch (error: any) {
      console.log('Upload error:', error?.message || error);
      Alert.alert('Upload Error', error.message || 'Failed to upload image.');
      setPhotoUploaded(false);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const categories = [
    { name: 'Pothole' },
    { name: 'Leakage' },
    { name: 'Street Light' },
    { name: 'Waste' },
    { name: 'Other' },
  ];

  const getCategoryIcon = (name: string, isActive: boolean) => {
    const iconColor = isActive ? '#ffffff' : '#00386c';
    switch (name) {
      case 'Pothole':
        return <PotholeIcon size={20} color={iconColor} />;
      case 'Leakage':
        return <LeakageIcon size={20} color={iconColor} />;
      case 'Street Light':
        return <LightbulbIcon size={20} color={iconColor} />;
      case 'Waste':
        return <TrashIcon size={20} color={iconColor} />;
      case 'Other':
        return <InfoIcon size={20} color={iconColor} />;
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Required Info', 'Please add some description for the issue.');
      return;
    }

    const user = session.getUser();
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to submit a complaint.');
      router.push('/');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${category === 'Other' ? customCategory || 'Other' : category} Issue at ${location.split(',')[0] || 'Unknown location'}`,
          description: description,
          category: category === 'Other' ? customCategory || 'Other' : category,
          latitude: latitude || 0,
          longitude: longitude || 0,
          address: location,
          citizen_id: user.user_id,
          priority: 'Medium',
          image_url: uploadedImageUrl,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setSubmittedId(result.data?.complaint_id || null);
        setSubmitted(true);
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        Alert.alert('Submission Failed', result.message || 'Failed to submit complaint.');
      }
    } catch (error) {
      console.log('Error submitting complaint:', error);
      Alert.alert('Connection Error', `Failed to connect to backend at ${API_BASE}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9ff" />
      <View style={styles.header}>
        <View style={styles.headerBranding}>
          <GovBuilding size={24} color="#00386c" />
          <Text style={styles.headerTitle}>CivicFlow</Text>
        </View>
        <Text style={styles.headerSubtitle}>File Report</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {submitted ? (
            <View style={styles.successContainer}>
              <CheckCircleIcon size={64} color="#00a86b" />
              <Text style={styles.successTitle}>Report Submitted!</Text>
              <Text style={styles.successSubtitle}>
                Thank you for contributing to your city.{submittedId ? ` Your tracking ID is #CF-${submittedId}.` : ''}
              </Text>
              <Text style={styles.redirectText}>Returning to dashboard...</Text>
            </View>
          ) : (
            <View style={styles.mainContainer}>
              <View style={styles.pageHeader}>
                <Text style={styles.pageTitle}>Report New Issue</Text>
                <Text style={styles.pageSubtitle}>
                  Help improve your community by detailing the public issue below.
                </Text>
              </View>

              <View style={styles.card}>
                {/* Photo Upload Container */}
                <View style={styles.inputContainer}>
                  <Text style={styles.fieldLabel}>UPLOAD PHOTO</Text>
                  <TouchableOpacity
                    style={[styles.uploadBox, photoUploaded && styles.uploadBoxActive, photoUploaded && { padding: 0, overflow: 'hidden' }]}
                    activeOpacity={0.8}
                    onPress={pickImage}
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? (
                      <ActivityIndicator size="large" color="#00386c" />
                    ) : photoUploaded && uploadedImageUrl ? (
                      <>
                        <Image 
                          source={{ uri: uploadedImageUrl }} 
                          style={{ width: '100%', height: '100%' }} 
                          resizeMode="cover" 
                        />
                        <View style={{ position: 'absolute', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
                          <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>Tap to change photo</Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <CameraIcon size={32} color="#737781" />
                        <Text style={styles.uploadText}>
                          Tap to capture or upload from gallery
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                  {photoUploaded && (
                    <Text style={[styles.photoFilename, { marginTop: 4, textAlign: 'center' }]}>{imageFileName}</Text>
                  )}
                  {isAnalyzing && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8, gap: 8 }}>
                      <ActivityIndicator size="small" color="#00386c" />
                      <Text style={{ fontSize: 12, color: '#00386c', fontWeight: '600' }}>AI is analyzing your photo...</Text>
                    </View>
                  )}
                </View>

                {/* Category Selection */}
                <View style={styles.inputContainer}>
                  <Text style={styles.fieldLabel}>SELECT CATEGORY</Text>
                  <TouchableOpacity
                    style={styles.dropdownHeader}
                    activeOpacity={0.8}
                    onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      {getCategoryIcon(category, false)}
                      <Text style={styles.dropdownHeaderText}>{category}</Text>
                    </View>
                    <Text style={{ color: '#00386c', fontWeight: '600' }}>{isDropdownOpen ? '▲' : '▼'}</Text>
                  </TouchableOpacity>

                  {isDropdownOpen && (
                    <View style={styles.dropdownList}>
                      {categories.map((cat) => (
                        <TouchableOpacity
                          key={cat.name}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setCategory(cat.name);
                            setIsDropdownOpen(false);
                          }}
                        >
                          <View style={{ marginRight: 8 }}>
                            {getCategoryIcon(cat.name, false)}
                          </View>
                          <Text style={styles.dropdownItemText}>{cat.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {category === 'Other' && (
                    <TextInput
                      style={[styles.locationInput, { height: 48, marginTop: 8, marginLeft: 0, borderWidth: 1, borderColor: '#c2c6d1', borderRadius: 12, paddingHorizontal: 12 }]}
                      value={customCategory}
                      onChangeText={setCustomCategory}
                      placeholder="Enter custom category"
                      placeholderTextColor="#737781"
                    />
                  )}
                </View>

                {/* Pinpoint Location */}
                <View style={styles.inputContainer}>
                  <Text style={styles.fieldLabel}>PINPOINT LOCATION</Text>
                  <View style={styles.locationWrapper}>
                    <MapPinIcon size={20} color="#00386c" />
                    <TextInput
                      style={styles.locationInput}
                      value={location}
                      onChangeText={setLocation}
                      placeholder="Enter location or street name"
                      placeholderTextColor="#737781"
                    />
                  </View>
                  <View style={styles.locationInfoRow}>
                    <InfoIcon size={14} color="#737781" />
                    <Text style={styles.locationInfoText}>
                      {latitude ? 'Real GPS location captured.' : 'Enter location manually or fetch.'}
                    </Text>
                    <TouchableOpacity onPress={fetchLocation} disabled={gettingLocation} style={{ marginLeft: 'auto' }}>
                      {gettingLocation ? (
                        <ActivityIndicator size="small" color="#00386c" />
                      ) : (
                        <Text style={{ color: '#00386c', fontSize: 12, fontWeight: '600' }}>Fetch GPS</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Additional Description */}
                <View style={styles.inputContainer}>
                  <Text style={styles.fieldLabel}>ADDITIONAL DESCRIPTION</Text>
                  <TextInput
                    style={styles.descriptionInput}
                    multiline
                    numberOfLines={4}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Describe the severity, damage, or landmarks nearby to help city staff locate it..."
                    placeholderTextColor="#737781"
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  activeOpacity={0.9}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>Submit Report</Text>
                      <ArrowRight size={18} color="#ffffff" />
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => router.push('/')}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

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
          <View style={styles.activeTabIndicator}>
            <PlusIcon size={24} color="#00386c" />
          </View>
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>Report</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
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
  mainContainer: {
    padding: 20,
    gap: 20,
  },
  pageHeader: {
    gap: 4,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0b1c30',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#424750',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    gap: 20,
    shadowColor: '#0b1c30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(194, 202, 209, 0.2)',
  },
  inputContainer: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#737781',
    letterSpacing: 0.5,
  },
  uploadBox: {
    height: 140,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#c2c6d1',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
    gap: 8,
    padding: 12,
  },
  uploadBoxActive: {
    borderColor: '#00386c',
    backgroundColor: 'rgba(0, 56, 108, 0.03)',
  },
  uploadText: {
    fontSize: 13,
    color: '#737781',
    textAlign: 'center',
  },
  uploadTextActive: {
    color: '#00386c',
    fontWeight: '600',
  },
  photoFilename: {
    fontSize: 11,
    color: '#737781',
    fontStyle: 'italic',
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9ff',
    borderWidth: 1,
    borderColor: '#c2c6d1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  dropdownHeaderText: {
    fontSize: 14,
    color: '#0b1c30',
    fontWeight: '500',
  },
  dropdownList: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c2c6d1',
    borderRadius: 12,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#eff4ff',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#424750',
  },
  locationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c2c6d1',
    paddingHorizontal: 12,
    height: 48,
  },
  locationInput: {
    flex: 1,
    color: '#0b1c30',
    fontSize: 14,
    marginLeft: 8,
    height: '100%',
    padding: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  locationInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 4,
  },
  locationInfoText: {
    fontSize: 11,
    color: '#737781',
  },
  descriptionInput: {
    backgroundColor: '#f8f9ff',
    borderWidth: 1,
    borderColor: '#c2c6d1',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#0b1c30',
    height: 100,
    textAlignVertical: 'top',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  actionButtons: {
    gap: 12,
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff6f32',
    height: 52,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#ff6f32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#c2c6d1',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00386c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#00386c',
    fontSize: 15,
    fontWeight: '600',
  },
  successContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00a86b',
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#424750',
    textAlign: 'center',
    lineHeight: 20,
  },
  redirectText: {
    fontSize: 12,
    color: '#737781',
    fontStyle: 'italic',
    marginTop: 20,
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
