import { Platform } from 'react-native';

// Use 10.0.2.2 for Android Emulators to access the host's localhost.
export const API_BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3000/api' 
  : 'http://localhost:3000/api';
