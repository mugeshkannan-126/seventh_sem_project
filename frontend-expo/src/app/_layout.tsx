import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'react-native';
import { AnimatedSplashOverlay } from '../components/animated-icon';
import { Chatbot } from '../components/Chatbot';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9ff" />
      <Slot />
      <AnimatedSplashOverlay />
      <Chatbot />
    </>
  );
}


