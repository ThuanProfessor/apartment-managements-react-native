import React from 'react';
import { View, StyleSheet } from 'react-native';

import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';

// Navigators
import AdminTabNavigator from './AdminTabNavigator';

// Screens
import ApartmentDetailScreen from '../screens/admin/ApartmentDetailScreen';

import SurveysScreen from '../screens/main/SurveysScreen';

import CardRequestScreen from '../screens/main/CardRequestScreen'; // Duyệt thẻ người thân
import CreateBillScreen from '../screens/admin/CreateBillScreen';

import RelativeCardApprovalScreen from '../screens/admin/RelativeCardApprovalScreen';
import AdminComplaintsScreen from '../screens/admin/AdminComplaintsScreen';
import FeedbackDetailScreen from '../screens/admin/FeedbackDetailScreen';


const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// ✅ Custom Drawer menu với nút đăng xuất
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

// ✅ Drawer chứa các màn hình chính
const DrawerContentNavigator = () => (
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
      name="AdminComplaints"
      component={AdminComplaintsScreen}
      options={{ title: 'Quản lý phản ánh' }}
    />
  </Drawer.Navigator>
);

// ✅ Stack ngoài bao drawer + thêm màn hình chi tiết căn hộ
const AdminNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainDrawer" component={DrawerContentNavigator} />
      <Stack.Screen
        name="ApartmentDetail"
        component={ApartmentDetailScreen}
        options={{ headerShown: true, title: 'Chi tiết căn hộ' }}
      />
      <Stack.Screen
        name="FeedbackDetailScreen"
        component={FeedbackDetailScreen}
        options={{ title: 'Chi tiết phản ánh' }}
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
    

    </Stack.Navigator>

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
