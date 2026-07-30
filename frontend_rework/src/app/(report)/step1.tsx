import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useReportStore } from '@/store/report.store';
import { COLORS } from '@/constants/colors';

export default function ReportStep1Screen() {
  const router = useRouter();
  const { setCategory, setDescription, setAddress, addImage, reset } = useReportStore();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState('Awaiting photo to process...');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiDetected, setAiDetected] = useState(false);

  useEffect(() => {
    reset();
  }, []);

  const processImageWithAI = (uri: string) => {
    setAiProcessing(true);
    setAiStatus('AI Auto-detecting category...');
    
    setTimeout(() => {
      setAiStatus('AI detecting... maybe Pothole?');
      
      setTimeout(() => {
        setAiStatus('AI: Category identified (Pothole)');
        setAiDetected(true);
        setAiProcessing(false);
        
        // Save detected values to draft report store
        addImage(uri);
        setCategory('pothole');
        setAddress('5th Avenue & Main St, Downtown');
        setDescription('Large pothole approximately 30cm in diameter detected on the road surface. Hazard for cyclists.');
      }, 1500);
    }, 1500);
  };

  const handleCapture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permissions are required to capture issue photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      processImageWithAI(uri);
    }
  };

  const handleUploadFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery access is required to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      processImageWithAI(uri);
    }
  };

  const handleNext = () => {
    if (!photoUri) {
      Alert.alert('Photo Required', 'Please capture or select a photo of the issue first.');
      return;
    }
    router.push('/(report)/analysis' as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Top AppBar */}
      <View className="h-16 flex-row items-center justify-between px-4 bg-surface border-b border-outline-variant sticky top-0 z-50">
        <View className="flex-row items-center gap-4">
          <Pressable
            onPress={() => router.back()}
            className="hover:bg-surface-variant transition-colors duration-200 p-2 rounded-full active:scale-95"
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </Pressable>
          <Text className="text-headline-lg-mobile font-bold text-primary">SmartCivic</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Pressable className="hover:bg-surface-variant transition-colors duration-200 p-2 rounded-full active:scale-95">
            <MaterialIcons name="notifications" size={24} color={COLORS.primary} />
          </Pressable>
          <Pressable className="hover:bg-surface-variant transition-colors duration-200 p-2 rounded-full active:scale-95">
            <MaterialIcons name="account-circle" size={24} color={COLORS.primary} />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        className="flex-1 max-w-2xl mx-auto w-full px-4" 
        contentContainerClassName="py-6 pb-28 gap-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Sleek, Premium Multi-step Progress Indicator */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between relative px-2">
            {/* Background Line (Gray) */}
            <View className="absolute top-5 left-8 right-8 h-[3px] bg-outline-variant z-0" />
            
            {/* Active Progress Line (Blue, up to first step) */}
            <View className="absolute top-5 left-8 w-[15%] h-[3px] bg-primary z-0" />
            
            {/* Step 1: Photo (Active with Ring Glow) */}
            <View className="z-10 items-center">
              <View 
                className="w-11 h-11 rounded-full items-center justify-center bg-primary shadow-lg"
                style={{
                  borderWidth: 3,
                  borderColor: '#eeefff',
                }}
              >
                <MaterialIcons name="photo-camera" size={18} color={COLORS.onPrimary} />
              </View>
              <Text className="text-label-lg font-bold text-primary mt-2">Photo</Text>
            </View>

            {/* Step 2: Location */}
            <View className="z-10 items-center">
              <View className="w-10 h-10 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center">
                <MaterialIcons name="map" size={16} color={COLORS.onSurfaceVariant} />
              </View>
              <Text className="text-label-lg font-semibold text-on-surface-variant mt-2">Location</Text>
            </View>

            {/* Step 3: Details */}
            <View className="z-10 items-center">
              <View className="w-10 h-10 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center">
                <MaterialIcons name="description" size={16} color={COLORS.onSurfaceVariant} />
              </View>
              <Text className="text-label-lg font-semibold text-on-surface-variant mt-2">Details</Text>
            </View>

            {/* Step 4: Review */}
            <View className="z-10 items-center">
              <View className="w-10 h-10 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center">
                <MaterialIcons name="fact-check" size={16} color={COLORS.onSurfaceVariant} />
              </View>
              <Text className="text-label-lg font-semibold text-on-surface-variant mt-2">Review</Text>
            </View>
          </View>
        </View>

        {/* Capture instructions */}
        <View>
          <Text className="text-headline-lg-mobile font-semibold text-on-surface">Capture the issue</Text>
          <Text className="text-body-lg text-on-surface-variant mt-2">
            Add a photo to help city officials identify the problem quickly.
          </Text>
        </View>

        {/* Camera Preview / Capture Card */}
        <View 
          className="relative group overflow-hidden bg-surface-container-highest border border-outline-variant flex-col items-center justify-center shadow-md"
          style={{ borderRadius: 24, aspectRatio: 4/3 }}
        >
          {photoUri ? (
            // Full clear preview of the clicked image
            <View className="absolute inset-0 w-full h-full">
              <Image
                source={photoUri}
                className="w-full h-full"
                contentFit="cover"
              />
              
              {/* Sleek Floating Retake Button in Corner */}
              <Pressable
                onPress={handleCapture}
                className="absolute top-4 right-4 bg-black/60 rounded-full px-4 py-2 flex-row items-center gap-2 border border-white/20 active:bg-black/80"
              >
                <MaterialIcons name="photo-camera" size={16} color="#ffffff" />
                <Text className="text-white text-label-lg font-bold">Retake</Text>
              </Pressable>
            </View>
          ) : (
            // Upload Prompt View
            <Pressable 
              onPress={handleCapture}
              className="w-full h-full items-center justify-center"
            >
              <Image
                source="https://lh3.googleusercontent.com/aida-public/AB6AXuBGYevY4ERDFZvcoqCkGsCI7a0n_m7C2Yt0KvtwdKX8_ifKT22kKt6012wNrdAXDLOLiVGNEv0UBWMzpFSzIt-Wxt3wp5Ul6BjTtgdcjzAuXH5RjlKO3n6ysa2FPKIGYp916oxL_OxHb436cEVULHGpvH_EpMCtt1zqrNC1BCUsYmAs37gEIPrlyqWqOK9UdDBUcr7eUNx0PF5esMrsh2JqC2l-0-mT46LFeHsP2ZylO0qgwpmmIB2C"
                className="w-full h-full absolute inset-0 opacity-30"
                contentFit="cover"
              />
              <View className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-lg transform group-hover:scale-110">
                <MaterialIcons name="photo-camera" size={32} color={COLORS.onPrimary} />
              </View>
              <Text className="text-title-lg font-bold text-on-surface mt-4">
                Capture Photo
              </Text>
            </Pressable>
          )}

          {/* AI Auto-detect status overlay */}
          <View className="absolute bottom-4 left-4 right-4 z-10">
            <View 
              className="rounded-xl px-4 py-3 flex-row items-center gap-3"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' }}
            >
              {aiProcessing ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <View 
                  className={`w-2.5 h-2.5 rounded-full ${aiDetected ? 'bg-secondary' : 'bg-primary'}`}
                />
              )}
              <Text className="text-body-md text-on-surface font-semibold italic">
                {aiStatus}
              </Text>
            </View>
          </View>
        </View>

        {/* Upload Option */}
        <Pressable 
          onPress={handleUploadFromGallery}
          className="w-full py-4 px-6 rounded-xl border-2 border-outline-variant flex-row items-center justify-center gap-3 bg-transparent active:bg-surface-container-low"
        >
          <MaterialIcons name="upload-file" size={24} color={COLORS.onSurfaceVariant} />
          <Text className="text-on-surface-variant font-bold text-title-lg">Upload from Gallery</Text>
        </Pressable>

        {/* Quick Tips Card */}
        <View className="bg-secondary-container/20 rounded-xl p-4 flex-row gap-3 items-start">
          <MaterialIcons name="info" size={24} color={COLORS.secondary} />
          <View className="flex-1">
            <Text className="text-label-lg font-bold text-on-secondary-container">Photo Tip</Text>
            <Text className="text-body-md text-on-secondary-container/80 mt-0.5">
              Make sure the photo is clear and taken in good lighting for faster resolution.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Action Bar */}
      <View 
        className="absolute bottom-0 left-0 right-0 bg-surface px-4 py-4 flex-row justify-between items-center border-t border-outline-variant"
      >
        <Pressable 
          onPress={() => router.back()}
          className="px-6 py-3 rounded-full active:bg-surface-variant"
        >
          <Text className="text-on-surface-variant font-bold text-title-lg">Back</Text>
        </Pressable>
        <Pressable 
          onPress={handleNext}
          className="px-6 py-3 rounded-full bg-primary flex-row items-center gap-2 shadow-md active:scale-95"
        >
          <Text className="text-on-primary font-bold text-title-lg">Next</Text>
          <MaterialIcons name="arrow-forward" size={20} color={COLORS.onPrimary} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
