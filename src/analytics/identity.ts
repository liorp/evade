import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@evade/analytics_user_id';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

let cachedUserId: string | null = null;

export async function getOrCreateUserId(): Promise<string> {
  if (cachedUserId) {
    return cachedUserId;
  }

  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      cachedUserId = stored;
      return stored;
    }

    const newId = generateUUID();
    await AsyncStorage.setItem(STORAGE_KEY, newId);
    cachedUserId = newId;
    return newId;
  } catch (_error) {
    const fallbackId = generateUUID();
    cachedUserId = fallbackId;
    return fallbackId;
  }
}

export function getCachedUserId(): string | null {
  return cachedUserId;
}
