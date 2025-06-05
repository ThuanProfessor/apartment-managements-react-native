import React from 'react';
import { View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Navigators
import TabNavigator from './TabNavigator';
import AdminTabNavigator from './AdminTabNavigator';

// Screens
import LockerScreen from '../screens/main/LockerScreen';
import BillsScreen from '../screens/main/BillListScreen';
import PaymentManualScreen from '../screens/main/PaymentManualScreen';
import PaymentVnpayScreen from '../screens/main/PaymentVnpayScreen';
import ComplaintsScreen from '../screens/main/ComplaintsScreen';
import UserSurveysScreen from '../screens/main/UserSurveysScreen';
import UserSurveysAnswerScreen from '../screens/main/UserSurveyAnswerScreen';
import ParkingCardScreen from '../screens/main/ParkingCardScreen';
import CardRequestScreen from '../screens/main/CardRequestScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Admin
import ApartmentManagementScreen from '../screens/admin/ApartmentManagementScreen';
import ResidentAccountsScreen from '../screens/admin/ResidentAccountsScreen';
import SurveyManagementScreen from '../screens/admin/SurveyManagementScreen';
import ApartmentDetailScreen from '../screens/admin/ApartmentDetailScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// 🔹 Nút mở Drawer (3 gạch)
const DrawerToggle = ({ navigation }) => (
  <View style={{ paddingLeft: 15 }}>
    <MaterialCommunityIcons
      name="menu"
      size={24}
      color="white"
      onPress={() => navigation.openDrawer()}
    />
  </View>
);

// 🔹 Stack chính (giữ nguyên logic cũ)
const MainStack = ({ navigation }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#6200ee' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        headerLeft: () => <DrawerToggle navigation={navigation} />,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={isAdmin ? AdminTabNavigator : TabNavigator}
        options={{ title: 'Trang chủ' }}
      />
      <Stack.Screen name="Locker" component={LockerScreen} options={{ title: 'Tủ Đồ' }} />
      <Stack.Screen name="Bill" component={BillsScreen} options={{ title: 'Hóa đơn' }} />
      <Stack.Screen name="Complaints" component={ComplaintsScreen} options={{ title: 'Phản ánh' }} />
    
      <Stack.Screen name="ParkingCard" component={ParkingCardScreen} options={{ title: 'Thẻ gửi xe' }} />
      <Stack.Screen name="RelativeCardRequest" component={CardRequestScreen} options={{ title: 'Đăng ký thẻ người thân' }} />
      <Stack.Screen name="PaymentManual" component={PaymentManualScreen} options={{ title: 'Thanh toán thủ công' }} />
      <Stack.Screen name="PaymentVnpay" component={PaymentVnpayScreen} options={{ title: 'Thanh toán VNPAY' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Hồ sơ cá nhân' }} />
      <Stack.Screen
        name="UserSurveys"
        component={UserSurveysScreen}
        options={{ title: 'Khảo sát' }}
       />
      <Stack.Screen
        name="UserSurveysAnswer"
        component={UserSurveysAnswerScreen}
        options={{ title: 'Trả lời khảo sát' }}
      />

      {/* Admin screens */}
      <Stack.Screen name="ApartmentManagement" component={ApartmentManagementScreen} options={{ title: 'QL Căn hộ' }} />
      <Stack.Screen name="ResidentAccounts" component={ResidentAccountsScreen} options={{ title: 'QL Tài khoản' }} />
      <Stack.Screen name="SurveyManagement" component={SurveyManagementScreen} options={{ title: 'QL Khảo sát' }} />
      <Stack.Screen name="ApartmentDetail" component={ApartmentDetailScreen} options={{ title: 'Chi tiết căn hộ' }} />
    </Stack.Navigator>
  );
};

// 🔹 Drawer content
const CustomDrawerContent = (props) => {
  const { logout } = useAuth();

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <DrawerItem
        label="🏠 Trang chủ"
        onPress={() => props.navigation.navigate('MainApp', { screen: 'MainTabs' })}
      />
      <DrawerItem
        label="👤 Hồ sơ"
        onPress={() => props.navigation.navigate('MainApp', { screen: 'Profile' })}
      />
      <DrawerItem
        label="🔓 Đăng xuất"
        onPress={logout}
        labelStyle={{ color: 'red' }}
        style={{ borderTopWidth: 1, borderTopColor: '#ccc', marginTop: 'auto' }}
      />
    </DrawerContentScrollView>
  );
};

// 🔹 Tổng navigator
const MainNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="MainApp" component={MainStack} />
    </Drawer.Navigator>
  );
};

export default MainNavigator;
