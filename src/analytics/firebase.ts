import { analyticsConfig } from './config';
import { getOrCreateUserId } from './identity';

let analytics: typeof import('@react-native-firebase/analytics').default | null = null;

async function getAnalytics() {
  if (!analyticsConfig.enabled) {
    return null;
  }

  if (!analytics) {
    try {
      analytics = require('@react-native-firebase/analytics').default;
    } catch (error) {
      console.warn('Firebase Analytics not available:', error);
      return null;
    }
  }

  return analytics;
}

export async function initializeFirebaseAnalytics(): Promise<void> {
  const firebaseAnalytics = await getAnalytics();
  if (!firebaseAnalytics) {
    if (analyticsConfig.debug) {
      console.log('[Analytics] Disabled in development');
    }
    return;
  }

  try {
    const userId = await getOrCreateUserId();
    await firebaseAnalytics().setUserId(userId);

    if (analyticsConfig.debug) {
      console.log('[Analytics] Initialized with user ID:', userId);
    }
  } catch (error) {
    console.warn('[Analytics] Initialization failed:', error);
  }
}

export async function logEvent(
  eventName: string,
  params?: object
): Promise<void> {
  if (analyticsConfig.debug) {
    console.log(`[Analytics] ${eventName}`, params);
  }

  const firebaseAnalytics = await getAnalytics();
  if (!firebaseAnalytics) {
    return;
  }

  try {
    await firebaseAnalytics().logEvent(eventName, params);
  } catch (error) {
    console.warn(`[Analytics] Failed to log ${eventName}:`, error);
  }
}

export async function setUserProperty(
  name: string,
  value: string | null
): Promise<void> {
  const firebaseAnalytics = await getAnalytics();
  if (!firebaseAnalytics) {
    return;
  }

  try {
    await firebaseAnalytics().setUserProperty(name, value);
  } catch (error) {
    console.warn(`[Analytics] Failed to set user property ${name}:`, error);
  }
}
