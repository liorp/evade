import './src/i18n';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { adManager } from './src/ads/adManager';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MainMenuScreen } from './src/screen/MainMenu';
import { PlayScreen } from './src/screen/Play';
import { SettingsScreen } from './src/screen/Settings';
import { HighScoresScreen } from './src/screen/HighScores';
import { InstructionsScreen } from './src/screen/Instructions';
import { COLORS } from './src/const/colors';

type RootStackParamList = {
  MainMenu: undefined;
  Play: undefined;
  Settings: undefined;
  HighScores: undefined;
  Instructions: { fromFirstPlay?: boolean };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    adManager.initialize();
  }, []);

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
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
