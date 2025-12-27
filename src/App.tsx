import './i18n';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { adManager } from './ads/adManager';
import { usePurchaseStore } from './state/purchaseStore';
import { useAdStore } from './state/adStore';
import { iapManager } from './iap/iapManager';
import { initAnalytics, trackAppOpened } from './analytics';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MainMenuScreen } from './screen/MainMenu';
import { PlayScreen } from './screen/Play';
import { SettingsScreen } from './screen/Settings';
import { HighScoresScreen } from './screen/HighScores';
import { InstructionsScreen } from './screen/Instructions';
import { ShopScreen } from './screen/Shop';
import { COLORS } from './const/colors';

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
