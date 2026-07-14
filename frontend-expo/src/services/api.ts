import { Platform } from 'react-native';

// Use the local computer's IP address for mobile devices, and localhost for web
export const API_BASE = Platform.OS === 'web'
  ? 'http://127.0.0.1:8000'
  : 'http://10.184.16.15:8000';

// Global session store to persist user login info across screens
class SessionStore {
  private currentUser: any = null;

  setUser(user: any) {
    this.currentUser = user;
  }

  getUser() {
    return this.currentUser;
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  logout() {
    this.currentUser = null;
  }
}

export const session = new SessionStore();
