import 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { MenuProvider } from 'react-native-popup-menu';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/auth/LoginScreen';
import InitialSetupScreen from './src/screens/auth/InitialSetupScreen';

import MainNavigator from './src/navigation/MainNavigator';       // 👈 dành cho cư dân
import AdminNavigator from './src/navigation/AdminNavigator';     // 👈 dành cho admin (mới tạo riêng)
import LoadingOverlay from './src/components/LoadingOverlay';

const Stack = createNativeStackNavigator();

const AppContent = () => {
  const { user, loading, isFirstLogin } = useAuth();

  if (loading) return <LoadingOverlay />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
      ) : isFirstLogin ? (
        <Stack.Screen
          name="InitialSetup"
          component={InitialSetupScreen}
          options={{
            title: 'Thiết lập tài khoản',
            headerShown: true,
            headerStyle: { backgroundColor: '#1a73e8' },
            headerTintColor: '#fff',
          }}
        />
      ) : user.role === 'ADMIN' ? (
        <Stack.Screen
          name="AdminMain"
          component={AdminNavigator}
          options={{ animation: 'fade_from_bottom' }}
        />
      ) : (
        <Stack.Screen
          name="UserMain"
          component={MainNavigator}
          options={{ animation: 'fade_from_bottom' }}
        />
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <PaperProvider>
          <MenuProvider skipInstanceCheck>
            <NavigationContainer>
              <AppContent />
            </NavigationContainer>
          </MenuProvider>
        </PaperProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
