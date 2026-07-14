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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
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
} from '../components/Icons';

export default function ComplaintScreen() {
  const router = useRouter();
  const [category, setCategory] = useState('Pothole');
  const [location, setLocation] = useState('420 Park Ave South, Manhattan');
  const [description, setDescription] = useState('');
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { name: 'Pothole' },
    { name: 'Leakage' },
    { name: 'Street Light' },
    { name: 'Waste' },
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
      default:
        return null;
    }
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      Alert.alert('Required Info', 'Please add some description for the issue.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        // Go back to Home dashboard
        router.push('/');
      }, 1500);
    }, 1500);
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
                Thank you for contributing to your city. Your tracking ID is #CF-9922.
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
                    style={[styles.uploadBox, photoUploaded && styles.uploadBoxActive]}
                    activeOpacity={0.8}
                    onPress={() => setPhotoUploaded(!photoUploaded)}
                  >
                    <CameraIcon size={32} color={photoUploaded ? '#00386c' : '#737781'} />
                    <Text style={[styles.uploadText, photoUploaded && styles.uploadTextActive]}>
                      {photoUploaded
                        ? 'Photo Uploaded Successfully!'
                        : 'Tap to capture or upload from gallery'}
                    </Text>
                    {photoUploaded && (
                      <Text style={styles.photoFilename}>IMG_20260714_1215.jpg</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Category Selection */}
                <View style={styles.inputContainer}>
                  <Text style={styles.fieldLabel}>SELECT CATEGORY</Text>
                  <View style={styles.categoryGrid}>
                    {categories.map((cat) => {
                      const isActive = category === cat.name;
                      return (
                        <TouchableOpacity
                          key={cat.name}
                          style={[styles.categoryButton, isActive && styles.categoryButtonActive]}
                          activeOpacity={0.8}
                          onPress={() => setCategory(cat.name)}
                        >
                          <View style={{ marginRight: 6 }}>
                            {getCategoryIcon(cat.name, isActive)}
                          </View>
                          <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                            {cat.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
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
                    <Text style={styles.locationInfoText}>Simulated current GPS location selected.</Text>
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
                  <Text style={styles.submitButtonText}>
                    {isSubmitting ? 'Processing...' : 'Submit Report'}
                  </Text>
                  {!isSubmitting && <ArrowRight size={18} color="#ffffff" />}
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
    paddingBottom: 40,
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#c2c6d1',
    borderRadius: 12,
    height: 48,
    backgroundColor: '#ffffff',
  },
  categoryButtonActive: {
    borderColor: '#ff6f32',
    backgroundColor: '#ff6f32',
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#424750',
  },
  categoryLabelActive: {
    color: '#ffffff',
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
});
