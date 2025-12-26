import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MainMenuScreen } from './src/screens/MainMenu';
import { PlayScreen } from './src/screens/Play';
import { SettingsScreen } from './src/screens/Settings';
import { COLORS } from './src/constants/colors';

type RootStackParamList = {
  MainMenu: undefined;
  Play: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="MainMenu"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="MainMenu" component={MainMenuScreen} />
          <Stack.Screen name="Play" component={PlayScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
