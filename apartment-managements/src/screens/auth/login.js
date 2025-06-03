import React, { useState, useContext } from "react";
import { Text, View, TextInput, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import MyContext from "../../config/MyContext"; // Context dùng useContext
import qs from "qs";
import { endAsyncEvent, endEvent } from "react-native/Libraries/Performance/Systrace";

import api, { API_ENDPOINTS, OAUTH_CONFIG } from "../../config/api";
const Login = ({ navigation }) => {
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const { dispatch } = useContext(MyContext);

const login = async () => {
  try {
    console.log("Đang thử đăng nhập với tài khoản:", { username });
    
    const loginUrl = `${API_ENDPOINTS.TOKEN}`;
    console.log("URL đăng nhập:", loginUrl);
    
    const loginData = {
      username: username,
      password: password,
      grant_type: "password",
      client_id: OAUTH_CONFIG.CLIENT_ID,
      client_secret: OAUTH_CONFIG.CLIENT_SECRET,
    };
    
    console.log("Dữ liệu gửi đi:", qs.stringify(loginData));
    
    const res = await api.post(loginUrl, qs.stringify(loginData), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    console.log("Login response:", res.data);
    
    const token = res.data.access_token;
    await AsyncStorage.setItem("access_token", token);

    // Gọi user info
    const userRes = await api.get(API_ENDPOINTS.CURRENT_USER, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch({ type: "login", payload: { user: userRes.data } });
    console.log("Login success!");
    
    // Navigate to home screen
    navigation.replace("Home");

  } catch (error) {
    console.log("Login error details:", error.response || error);
    console.log("Login result:", {
      error: "Login failed. Please try again.",
      success: false,
    });
  }
};

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        Đăng nhập
      </Text>

      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        autoCapitalize="none"
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 20, padding: 8 }}
      />
      <TouchableOpacity onPress={login}>
        <Text style={{ color: "blue" }}>Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;
