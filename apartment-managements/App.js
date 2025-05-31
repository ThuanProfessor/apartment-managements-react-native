import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import LoginScreen from './src/screens/auth/LoginScreen';
import InitialSetupScreen from './src/screens/auth/InitialSetupScreen';
import HomeScreen from './src/screens/main/HomeScreen';
import PaymentManualScreen from './src/screens/main/PaymentManualScreen';
import PaymentVnpayScreen from './src/screens/main/PaymentVnpayScreen';
import BillListScreen from './src/screens/main/BillListScreen';
import LockerScreen from './src/screens/main/LockerScreen';
import MyContext from "./src/context/MyContext";
import MyUserReducer from "./src/reducers/Myreducer";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <PaperProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
              <Stack.Screen 
                name="Login" 
                component={LoginScreen} 
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="InitialSetup"
                component={InitialSetupScreen}
                options={{
                  headerShown: false,
                  gestureEnabled: false
                }}
              />
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{
                  headerShown: true,
                  title: 'Trang chủ',
                  headerLeft: null,
                  gestureEnabled: false
                }}
              />
              <Stack.Screen
                name="PaymentManual"
                component={PaymentManualScreen}
                options={{
                  headerShown: true,
                  title: 'Thanh toán thủ công',
                  headerLeft: null,
                  gestureEnabled: false
                }}
              />
              <Stack.Screen
                name="PaymentVnpay"
                component={PaymentVnpayScreen}
                options={{
                  headerShown: true,
                  title: 'Thanh toán VNPay',
                  headerLeft: null,
                  gestureEnabled: false
                }}
              />
              <Stack.Screen
                name="BillList"
                component={BillListScreen}
                options={{
                  headerShown: true,
                  title: 'Danh sách hóa đơn',
                  headerLeft: null,
                  gestureEnabled: false
                }}
              />
              <Stack.Screen
                name="Locker"
                component={LockerScreen}
                options={{
                  headerShown: true,
                  title: 'Tủ đồ',
                  headerLeft: null,
                  gestureEnabled: false
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </GestureHandlerRootView>
      </PaperProvider>
    </AuthProvider>
  );
}
