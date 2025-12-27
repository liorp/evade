import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// Check if running on web
export const isWeb = Platform.OS === 'web';

// Check if running in Expo Go vs a development build
export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Check if running in a development build
export const isDevBuild = Constants.executionEnvironment === ExecutionEnvironment.Standalone ||
                          Constants.executionEnvironment === ExecutionEnvironment.Bare;

// Check if running on native platform (not web, not Expo Go)
export const isNative = !isWeb && !isExpoGo;
