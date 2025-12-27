import { isWeb } from '../utils/environment';
import { analyticsConfig } from './config';
import { getOrCreateUserId } from './identity';

// Type definitions for Firebase Analytics
type FirebaseAnalyticsNative = typeof import('@react-native-firebase/analytics').default;
type FirebaseAnalyticsWeb = ReturnType<typeof import('firebase/analytics').getAnalytics>;

let nativeAnalytics: FirebaseAnalyticsNative | null = null;
let webAnalytics: FirebaseAnalyticsWeb | null = null;
let webApp: ReturnType<typeof import('firebase/app').initializeApp> | null = null;

async function getWebAnalytics(): Promise<FirebaseAnalyticsWeb | null> {
  if (!analyticsConfig.enabled) {
    return null;
  }

  if (webAnalytics) {
    return webAnalytics;
  }

  try {
    const { firebaseWebConfig, isFirebaseWebConfigured } = await import('../firebase/web');
    if (!isFirebaseWebConfigured()) {
      console.warn('[Analytics] Firebase web config not set up');
      return null;
    }

    const { initializeApp, getApps } = await import('firebase/app');
    const { getAnalytics } = await import('firebase/analytics');

    // Initialize app if not already done
    if (getApps().length === 0) {
      webApp = initializeApp(firebaseWebConfig);
    } else {
      webApp = getApps()[0];
    }

    webAnalytics = getAnalytics(webApp);
    return webAnalytics;
  } catch (error) {
    console.warn('[Analytics] Firebase web SDK not available:', error);
    return null;
  }
}

async function getNativeAnalytics(): Promise<FirebaseAnalyticsNative | null> {
  if (!analyticsConfig.enabled) {
    return null;
  }

  if (nativeAnalytics) {
    return nativeAnalytics;
  }

  try {
    nativeAnalytics = require('@react-native-firebase/analytics').default;
    return nativeAnalytics;
  } catch (error) {
    console.warn('[Analytics] Firebase native SDK not available:', error);
    return null;
  }
}

export async function initializeFirebaseAnalytics(): Promise<void> {
  if (analyticsConfig.debug) {
    console.log('[Analytics] Initializing...', { isWeb });
  }

  try {
    const userId = await getOrCreateUserId();

    if (isWeb) {
      const analytics = await getWebAnalytics();
      if (analytics) {
        const { setUserId } = await import('firebase/analytics');
        setUserId(analytics, userId);
      }
    } else {
      const analytics = await getNativeAnalytics();
      if (analytics) {
        await analytics().setUserId(userId);
      }
    }

    if (analyticsConfig.debug) {
      console.log('[Analytics] Initialized with user ID:', userId);
    }
  } catch (error) {
    console.warn('[Analytics] Initialization failed:', error);
  }
}

export async function logEvent(eventName: string, params?: object): Promise<void> {
  if (analyticsConfig.debug) {
    console.log(`[Analytics] ${eventName}`, params);
  }

  try {
    if (isWeb) {
      const analytics = await getWebAnalytics();
      if (analytics) {
        const { logEvent: firebaseLogEvent } = await import('firebase/analytics');
        firebaseLogEvent(analytics, eventName, params);
      }
    } else {
      const analytics = await getNativeAnalytics();
      if (analytics) {
        await analytics().logEvent(eventName, params);
      }
    }
  } catch (error) {
    console.warn(`[Analytics] Failed to log ${eventName}:`, error);
  }
}

export async function setUserProperty(name: string, value: string | null): Promise<void> {
  try {
    if (isWeb) {
      const analytics = await getWebAnalytics();
      if (analytics) {
        const { setUserProperties } = await import('firebase/analytics');
        setUserProperties(analytics, { [name]: value });
      }
    } else {
      const analytics = await getNativeAnalytics();
      if (analytics) {
        await analytics().setUserProperty(name, value);
      }
    }
  } catch (error) {
    console.warn(`[Analytics] Failed to set user property ${name}:`, error);
  }
}
