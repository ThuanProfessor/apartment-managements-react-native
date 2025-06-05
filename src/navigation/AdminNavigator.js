// src/navigation/AdminNavigator.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';

import { useAuth } from '../context/AuthContext';
import RelativeCardApprovalScreen from '../screens/admin/RelativeCardApprovalScreen';


// Navigators
import AdminTabNavigator from './AdminTabNavigator';

// Screens
import ComplaintsScreen from '../screens/main/ComplaintsScreen';
import SurveysScreen from '../screens/main/SurveysScreen';
import CardRequestScreen from '../screens/main/CardRequestScreen'; // Duyệt thẻ người thân
import CreateBillScreen from '../screens/admin/CreateBillScreen';
const Drawer = createDrawerNavigator();

// Custom menu trái với nút Đăng xuất
const CustomDrawerContent = (props) => {
  const { logout } = useAuth();

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <DrawerItemList {...props} />
      <View style={styles.logoutContainer}>
        <DrawerItem
          label="🔓 Đăng xuất"
          onPress={logout}
          labelStyle={{ color: 'red', fontWeight: 'bold' }}
        />
      </View>
    </DrawerContentScrollView>
  );
};

const AdminNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="AdminTabs"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: '#6200ee',
      }}
    >
      <Drawer.Screen
        name="AdminTabs"
        component={AdminTabNavigator}
        options={{ title: 'Trang chủ' }}
      />
      <Drawer.Screen
        name="Complaints"
        component={ComplaintsScreen}
        options={{ title: 'Phản ánh' }}
      />
      <Drawer.Screen
        name="Surveys"
        component={SurveysScreen}
        options={{ title: 'Khảo sát' }}
      />
      <Drawer.Screen
        name="RelativeCardApproval"
        component={RelativeCardApprovalScreen}
        options={{ title: 'Duyệt thẻ người thân' }}
      />
      <Drawer.Screen
        name="CreateBill"
        component={CreateBillScreen}
        options={{ title: 'Tạo hóa đơn cư dân' }}
      />
    </Drawer.Navigator>
  );
};

export default AdminNavigator;

const styles = StyleSheet.create({
  logoutContainer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
});
