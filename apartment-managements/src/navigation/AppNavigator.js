import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import ChangePasswordScreen from '../screens/auth/ChangePasswordScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import PaymentsScreen from '../screens/main/PaymentsScreen';
import ParkingScreen from '../screens/main/ParkingScreen';
import LockerScreen from '../screens/main/LockerScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import ComplaintsScreen from '../screens/main/ComplaintsScreen';
import SurveysScreen from '../screens/main/SurveysScreen';
import ChatScreen from '../screens/main/ChatScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator>
      {user ? (
        // Main Stack
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Payments"
            component={PaymentsScreen}
          />
          <Stack.Screen
            name="Parking"
            component={ParkingScreen}
          />
          <Stack.Screen
            name="Locker"
            component={LockerScreen}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
          />
          <Stack.Screen
            name="Complaints"
            component={ComplaintsScreen}
          />
          <Stack.Screen
            name="Surveys"
            component={SurveysScreen}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
          />
          <Stack.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
          />
        </>
      ) : (
        // Auth Stack
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
};
