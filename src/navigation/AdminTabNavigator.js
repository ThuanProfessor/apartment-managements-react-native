import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import ResidentAccountsScreen from '../screens/admin/ResidentAccountsScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';


const Tab = createBottomTabNavigator();

const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6200ee',
        tabBarLabelStyle: { fontSize: 13 },
        tabBarStyle: {
          backgroundColor: '#fff',
          paddingBottom: 4,
          height: 60,
          borderTopColor: '#eee',
        },
      }}
    >
      <Tab.Screen
        name="ApartmentList"
        component={AdminHomeScreen}
        options={{
          title: 'Căn hộ',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-city-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ResidentList"
        component={ResidentAccountsScreen}
        options={{
          title: 'Cư dân',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminTabNavigator;
