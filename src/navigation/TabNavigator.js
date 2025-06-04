import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Các màn hình
import HomeScreen from '../screens/main/HomeScreen';
import ComplaintsScreen from '../screens/main/ComplaintsScreen';
import SurveysScreen from '../screens/main/SurveysScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6200ee',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Complaints"
        component={ComplaintsScreen}
        options={{
          tabBarLabel: 'Phản ánh',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="alert-circle-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Surveys"
        component={SurveysScreen}
        options={{
          tabBarLabel: 'Khảo sát',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="poll" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
