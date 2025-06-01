import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
const Drawer = createDrawerNavigator();

const MainDrawer = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        drawerStyle: {
          backgroundColor: '#fff',
          width: 280,
        },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Trang chủ',
          drawerIcon: ({ color }) => <MaterialCommunityIcons name="home" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Payments"
        component={PaymentsScreen}
        options={{
          title: 'Thanh toán phí',
          drawerIcon: ({ color }) => <MaterialCommunityIcons name="cash" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Parking"
        component={ParkingScreen}
        options={{
          title: 'Quản lý đỗ xe',
          drawerIcon: ({ color }) => <MaterialCommunityIcons name="car" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Locker"
        component={LockerScreen}
        options={{
          title: 'Tủ đồ điện tử',
          drawerIcon: ({ color }) => <MaterialCommunityIcons name="locker" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Complaints"
        component={ComplaintsScreen}
        options={{
          title: 'Phản ánh',
          drawerIcon: ({ color }) => <MaterialCommunityIcons name="message-alert" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Surveys"
        component={SurveysScreen}
        options={{
          title: 'Khảo sát',
          drawerIcon: ({ color }) => <MaterialCommunityIcons name="poll" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: 'Trò chuyện',
          drawerIcon: ({ color }) => <MaterialCommunityIcons name="chat" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Thông tin cá nhân',
          drawerIcon: ({ color }) => <MaterialCommunityIcons name="account" size={24} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
};

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        // Auth Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
            options={{
              headerShown: true,
              title: 'Đổi mật khẩu',
              headerStyle: {
                backgroundColor: '#2196F3',
              },
              headerTintColor: '#fff',
            }}
          />
        </>
      ) : (
        // Main Stack
        <Stack.Screen name="MainApp" component={MainDrawer} />
      )}
    </Stack.Navigator>
  );
};
