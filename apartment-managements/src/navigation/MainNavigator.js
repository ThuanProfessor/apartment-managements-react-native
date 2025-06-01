import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import PaymentWebView from '../screens/payment/PaymentWebView';
import PaymentSuccessScreen from '../screens/payment/PaymentSuccessScreen';
import SurveyScreen from '../screens/main/SurveyScreen';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Screens
import HomeScreen from '../screens/main/HomeScreen';
import BillsScreen from '../screens/main/BillListScreen';
import PaymentsScreen from '../screens/main/PaymentsScreen';
import ComplaintsScreen from '../screens/main/ComplaintsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import ApartmentManagementScreen from '../screens/admin/ApartmentManagementScreen';
import ResidentAccountsScreen from '../screens/admin/ResidentAccountsScreen';
import SurveyManagementScreen from '../screens/admin/SurveyManagementScreen';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const TabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Bills':
              iconName = focused ? 'file-document' : 'file-document-outline';
              break;
            case 'Payments':
              iconName = focused ? 'credit-card' : 'credit-card-outline';
              break;
            case 'Complaints':
              iconName = focused ? 'message-alert' : 'message-alert-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: 'white',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Trang chủ'
        }}
      />
      <Tab.Screen 
        name="Bills" 
        component={BillsScreen}
        options={{
          title: 'Hóa đơn'
        }}
      />
      <Tab.Screen 
        name="Complaints" 
        component={ComplaintsScreen}
        options={{
          title: 'Phản ánh'
        }}
      />
      <Tab.Screen 
        name="Survey" 
        component={SurveyScreen}
        options={{
          title: 'Khảo sát'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Tài khoản'
        }}
      />

    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#fff',
          width: 280,
        },
        drawerType: 'front',
      }}
    >
      <Drawer.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{
          title: 'Trang chủ',
          drawerIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" size={24} color={color} />
          ),
        }}
      />

      {isAdmin && (
        <>
          <Drawer.Screen
            name="ApartmentManagement"
            component={ApartmentManagementScreen}
            options={{
              title: 'Quản lý căn hộ',
              drawerIcon: ({ color }) => (
                <MaterialCommunityIcons name="office-building" size={24} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="ResidentAccounts"
            component={ResidentAccountsScreen}
            options={{
              title: 'Quản lý tài khoản',
              drawerIcon: ({ color }) => (
                <MaterialCommunityIcons name="account-group" size={24} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="SurveyManagement"
            component={SurveyManagementScreen}
            options={{
              title: 'Quản lý khảo sát',
              drawerIcon: ({ color }) => (
                <MaterialCommunityIcons name="clipboard-text" size={24} color={color} />
              ),
            }}
          />
        </>
      )}
    </Drawer.Navigator>
  );
};

export default MainNavigator;
