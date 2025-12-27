// Firebase Web Configuration
// Get these values from Firebase Console -> Project Settings -> Your apps -> Web app
// If you don't have a web app registered, click "Add app" and select Web

export const firebaseWebConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  measurementId: '', // Required for Analytics
};

// Check if web config is properly set up
export function isFirebaseWebConfigured(): boolean {
  return !!(
    firebaseWebConfig.apiKey &&
    firebaseWebConfig.projectId &&
    firebaseWebConfig.appId
  );
}
