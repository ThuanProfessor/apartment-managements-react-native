import React, { useReducer } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import Home from "./Home/Home";
import PaymentManualScreen from "./Home/PaymentManualScreen";
import Login from "./Home/login";
import MyUserReducer from "./Reducer/Myreducer";
import MyContext from "./configs/MyContext";
import PaymentVnpayScreen from "./Home/PaymentVnpayScreen";
import BillListScreen from "./Home/BillListScreen";
import LockerScreen from "./Home/LockerScreen";
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function DrawerScreens() {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: true }}>
      <Drawer.Screen name="Home" component={Home} options={{ title: "Trang chủ" }} />
      <Drawer.Screen
        name="PaymentManual"
        component={PaymentManualScreen}
        options={{ title: "Thanh toán thủ công" }}
      />
      {/* XÓA PaymentVnpay khỏi Drawer */}
    </Drawer.Navigator>
  );
}

export default function App() {
  const [User, dispatch] = useReducer(MyUserReducer, null);

  return (
    <MyContext.Provider value={{ User, dispatch }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {User === null ? (
            <Stack.Screen name="Login" component={Login} />
          ) : (
            <>
              <Stack.Screen name="Main" component={DrawerScreens} />
              <Stack.Screen name="PaymentVnpay" component={PaymentVnpayScreen} />
              <Stack.Screen name="PaymentManual" component={PaymentManualScreen} />
              <Stack.Screen name="BillList" component={BillListScreen} />
              <Stack.Screen name="Locker" component={LockerScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </MyContext.Provider>
  );
}