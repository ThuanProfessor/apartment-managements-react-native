import React from 'react';
import { View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  MenuProvider,
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Screens
import TabNavigator from './TabNavigator';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import ApartmentManagementScreen from '../screens/admin/ApartmentManagementScreen';
import ResidentAccountsScreen from '../screens/admin/ResidentAccountsScreen';
import SurveyManagementScreen from '../screens/admin/SurveyManagementScreen';
import ApartmentDetailScreen from '../screens/admin/ApartmentDetailScreen';
import AdminTabNavigator from './AdminTabNavigator';

import LockerScreen from '../screens/main/LockerScreen';
import BillsScreen from '../screens/main/BillListScreen';
import PaymentManualScreen from '../screens/main/PaymentManualScreen';
import PaymentVnpayScreen from '../screens/main/PaymentVnpayScreen';
import ComplaintsScreen from '../screens/main/ComplaintsScreen';
import SurveysScreen from '../screens/main/SurveysScreen';
import ParkingCardScreen from '../screens/main/ParkingCardScreen';
import RelativeCardScreen from '../screens/main/RelativeCardScreen';
import CardRequestScreen from '../screens/main/CardRequestScreen';

const Stack = createStackNavigator();

const MenuButton = ({ navigation }) => {
  const { user, logout } = useAuth(); 
  const isAdmin = user?.role === 'ADMIN';


  return (
    <Menu>
      <MenuTrigger>
        <View style={{ paddingHorizontal: 15 }}>
          <MaterialCommunityIcons name="menu" size={24} color="white" />
        </View>
      </MenuTrigger>
      <MenuOptions>
        <MenuOption onSelect={() => navigation.navigate('MainTabs')} text="Trang chủ" />
        <MenuOption onSelect={() => navigation.navigate('Complaints')} text="Phản ánh" />
        <MenuOption onSelect={() => navigation.navigate('Surveys')} text="Khảo sát" />
        <MenuOption onSelect={() => navigation.navigate('RelativeCardRequest')} text="Thẻ người thân" />

        {isAdmin && (
          <>
            <MenuOption onSelect={() => navigation.navigate('ApartmentManagement')} text="Quản lý căn hộ" />
            <MenuOption onSelect={() => navigation.navigate('ResidentAccounts')} text="Quản lý tài khoản" />
            <MenuOption onSelect={() => navigation.navigate('SurveyManagement')} text="Quản lý khảo sát" />
              <MenuOption onSelect={logout} text="Đăng xuất" />
          </>
        )}
      </MenuOptions>
    </Menu>
  );
};

const MainNavigator = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
   
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          headerStyle: { backgroundColor: '#6200ee' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => <MenuButton navigation={navigation} />,
        })}
      >
        <Stack.Screen
          name="MainTabs"
          component={isAdmin ? AdminTabNavigator : TabNavigator}
          options={{ title: 'Trang chủ' }}
        />
        <Stack.Screen name="Locker" component={LockerScreen} options={{ title: 'Tủ Đồ' }} />
        <Stack.Screen name="Bill" component={BillsScreen} options={{ title: 'Hóa đơn' }} />
        <Stack.Screen name="Complaints" component={ComplaintsScreen} options={{ title: 'Phản ánh' }} />
        <Stack.Screen name="Surveys" component={SurveysScreen} options={{ title: 'Khảo sát' }} />
        <Stack.Screen name="ParkingCard" component={ParkingCardScreen} options={{ title: 'Thẻ gửi xe' }} />
        <Stack.Screen name="RelativeCardRequest" component={CardRequestScreen} options={{ title: 'Đăng ký thẻ người thân' }} />
        <Stack.Screen name="PaymentManual" component={PaymentManualScreen} options={{ title: 'Thanh toán thủ công' }} />
        <Stack.Screen name="PaymentVnpay" component={PaymentVnpayScreen} options={{ title: 'Thanh toán VNPAY' }} />

        {/* Admin screens */}
        <Stack.Screen name="ApartmentManagement" component={ApartmentManagementScreen} options={{ title: 'QL Căn hộ' }} />
        <Stack.Screen name="ResidentAccounts" component={ResidentAccountsScreen} options={{ title: 'QL Tài khoản' }} />
        <Stack.Screen name="SurveyManagement" component={SurveyManagementScreen} options={{ title: 'QL Khảo sát' }} />
        <Stack.Screen name="ApartmentDetail" component={ApartmentDetailScreen} options={{ title: 'Chi tiết căn hộ' }} />
      </Stack.Navigator>
    
  );
};

export default MainNavigator;
