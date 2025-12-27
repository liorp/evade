import './src/i18n';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { adManager } from './src/ads/adManager';
import { usePurchaseStore } from './src/state/purchaseStore';
import { useAdStore } from './src/state/adStore';
import { iapManager } from './src/iap/iapManager';
import { initAnalytics, trackAppOpened } from './src/analytics';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MainMenuScreen } from './src/screen/MainMenu';
import { PlayScreen } from './src/screen/Play';
import { SettingsScreen } from './src/screen/Settings';
import { HighScoresScreen } from './src/screen/HighScores';
import { InstructionsScreen } from './src/screen/Instructions';
import { ShopScreen } from './src/screen/Shop';
import { COLORS } from './src/const/colors';

type RootStackParamList = {
  MainMenu: undefined;
  Play: undefined;
  Settings: undefined;
  HighScores: undefined;
  Instructions: { fromFirstPlay?: boolean };
  Shop: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const { adsRemoved } = usePurchaseStore();
  const { setAdsRemoved } = useAdStore();

  useEffect(() => {
    const setupAnalytics = async () => {
      await initAnalytics();
      trackAppOpened({
        source: 'cold',
        app_version: Constants.expoConfig?.version ?? '1.0.0',
      });
    };
    setupAnalytics();
  }, []);

  useEffect(() => {
    adManager.initialize();
  }, []);

  useEffect(() => {
    // Sync purchase state to ad store
    setAdsRemoved(adsRemoved);

    // Initialize IAP
    iapManager.initialize();

    return () => {
      iapManager.disconnect();
    };
  }, [adsRemoved, setAdsRemoved]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="MainMenu"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
          }}
        >
          <Stack.Screen name="MainMenu" component={MainMenuScreen} />
          <Stack.Screen
            name="Play"
            component={PlayScreen}
            options={{ animation: 'fade', gestureEnabled: false }}
          />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="HighScores" component={HighScoresScreen} />
          <Stack.Screen name="Instructions" component={InstructionsScreen} />
          <Stack.Screen name="Shop" component={ShopScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
