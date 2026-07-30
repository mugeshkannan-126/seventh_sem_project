import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use the local computer's IP address for mobile devices, and localhost for web
export const API_BASE = Platform.OS === 'web'
  ? 'http://127.0.0.1:8000'
  : 'http://10.184.16.15:8000';

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
