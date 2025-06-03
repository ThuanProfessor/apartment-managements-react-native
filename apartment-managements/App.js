import 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import InitialSetupScreen from './src/screens/auth/InitialSetupScreen';

// Navigators
import AppNavigator from './src/navigation/AppNavigator';
import MainNavigator from './src/navigation/MainNavigator';

// Components
import LoadingOverlay from './src/components/LoadingOverlay';

const Stack = createNativeStackNavigator();

const AppContent = () => {
  const { user, loading, isFirstLogin } = useAuth();

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      {!user ? (
        // Auth Stack
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{
            animation: 'slide_from_bottom'
          }}
        />
      ) : isFirstLogin ? (
        // Initial Setup Stack
        <Stack.Screen
          name="InitialSetup"
          component={InitialSetupScreen}
          options={{
            headerShown: true,
            title: 'Thiết lập tài khoản',
            headerStyle: {
              backgroundColor: '#1a73e8',
            },
            headerTintColor: '#fff',
            gestureEnabled: false,
          }}
        />
      ) : (
        // Main App Stack
        <Stack.Screen
          name="MainApp"
          component={MainNavigator}
          options={{
            gestureEnabled: false,
            animation: 'fade'
          }}
        />
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PaperProvider>
        <GestureHandlerRootView style={styles.container}>
          <NavigationContainer>
            <AppContent />
          </NavigationContainer>
        </GestureHandlerRootView>
      </PaperProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
