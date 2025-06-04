import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { MenuProvider, Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
// import PaymentScreen from '../screens/main/PaymentScreen';
import BillsScreen from '../screens/main/BillListScreen';
import LockerScreen from '../screens/main/LockerScreen';
import PaymentManualScreen from '../screens/main/PaymentManualScreen';
import PaymentVnpayScreen from '../screens/main/PaymentVnpayScreen';
// Navigators và Screens
import TabNavigator from './TabNavigator'; // đảm bảo bạn đã export default từ file TabNavigator
import ApartmentManagementScreen from '../screens/admin/ApartmentManagementScreen';
import ResidentAccountsScreen from '../screens/admin/ResidentAccountsScreen';
import SurveyManagementScreen from '../screens/admin/SurveyManagementScreen';
import ComplaintsScreen from '../screens/main/ComplaintsScreen';
import SurveysScreen from '../screens/main/SurveysScreen';

const Stack = createStackNavigator();

const MenuButton = ({ navigation }) => {
  const { user } = useAuth();
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
        {isAdmin && (
          <>
            <MenuOption onSelect={() => navigation.navigate('ApartmentManagement')} text="Quản lý căn hộ" />
            <MenuOption onSelect={() => navigation.navigate('ResidentAccounts')} text="Quản lý tài khoản" />
            <MenuOption onSelect={() => navigation.navigate('SurveyManagement')} text="Quản lý khảo sát" />
          </>
        )}
      </MenuOptions>
    </Menu>
  );
};

const MainNavigator = () => {
  return (
    <MenuProvider>
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          headerStyle: { backgroundColor: '#6200ee' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => <MenuButton navigation={navigation} />,
        })}
      >
        <Stack.Screen name="MainTabs" component={TabNavigator} options={{ title: 'Trang chủ' }} />
        <Stack.Screen name="Locker" component={LockerScreen} options={{ title: 'Tủ Đồ' }} />
        <Stack.Screen name="Bill" component={BillsScreen} options={{ title: 'Hóa đơn' }} />
        <Stack.Screen name="Complaints" component={ComplaintsScreen} options={{ title: 'Phản ánh' }} />
        <Stack.Screen name="Surveys" component={SurveysScreen} options={{ title: 'Khảo sát' }} />
        <Stack.Screen name="PaymentManual" component={PaymentManualScreen} options={{ title: 'Thanh toán thủ công' }} />
        <Stack.Screen name="PaymentVnpay" component={PaymentVnpayScreen} options={{ title: 'Thanh toán VNPAY' }} />
        <Stack.Screen name="ApartmentManagement" component={ApartmentManagementScreen} options={{ title: 'QL Căn hộ' }} />
        <Stack.Screen name="ResidentAccounts" component={ResidentAccountsScreen} options={{ title: 'QL Tài khoản' }} />
        <Stack.Screen name="SurveyManagement" component={SurveyManagementScreen} options={{ title: 'QL Khảo sát' }} />
      </Stack.Navigator>
    </MenuProvider>
  );
};

export default MainNavigator;
