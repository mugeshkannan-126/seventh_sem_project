import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const getBackendUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://127.0.0.1:8000';
  }
  // Try to derive host IP dynamically from Expo dev server
  const hostUri = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip) {
      return `http://${ip}:8000`;
    }
  }
  // Fallback to PC current Wi-Fi IPv4 address
  return 'http://10.106.11.15:8000';
};

export const API_BASE = getBackendUrl();

// Global session store to persist user login info across screens
class SessionStore {
  private currentUser: any = null;
  private initialized: boolean = false;

  async init() {
    if (this.initialized) return;
    try {
      const storedUser = await AsyncStorage.getItem('@user_session');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    } catch (e) {
      console.log('Error loading session', e);
    } finally {
      this.initialized = true;
    }
  }

  setUser(user: any, remember: boolean = false) {
    this.currentUser = user;
    if (remember) {
      AsyncStorage.setItem('@user_session', JSON.stringify(user)).catch(e => console.log('Error saving session', e));
    } else {
      AsyncStorage.removeItem('@user_session').catch(e => console.log('Error removing session', e));
    }
  }

  getUser() {
    return this.currentUser;
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  logout() {
    this.currentUser = null;
    AsyncStorage.removeItem('@user_session').catch(e => console.log('Error removing session', e));
  }
}

export const session = new SessionStore();
