import React, { useState, useContext } from "react";
import { Text, View, TextInput, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import MyContext from "../../config/MyContext"; // Context dùng useContext
import qs from "qs";
import { endAsyncEvent, endEvent } from "react-native/Libraries/Performance/Systrace";

import api, { API_ENDPOINTS } from "../../config/api";
const Login = ({ navigation }) => {
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const { dispatch } = useContext(MyContext);

 const login = async () => {
  try {
    console.log("Login function called");
    console.log("Username:", username);     
    console.log("Password:", password);
    const res = await API.post(
      endpoints['login'],
      qs.stringify({
        'username': username,
        'password': password,
        'grant_type': "password",
        'client_id': "aPwlnbB1gdvRBos9vtEatNVEQWx8wMA4jbzAQKCc",
        'client_secret': "6UK1kV2eeBuG788EOTJfgnBJVrPyZL2PO7LqarE08YPKRHa7zNNK2DHZbr5aL6LkywQNd0isjCM6FmMjxCZdoc10DFezBkwqgXDpDzvFJKXXg4V3avGJwgfAhHP1Rt3y",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const token = res.data.access_token;
    await AsyncStorage.setItem("access_token", token);

    // Gọi user info
    const userRes = await authAPI(token).get(endpoints["current-user"]);
    dispatch({ type: "login", payload: { username: userRes.data } });

  } catch (ex) {
   
    console.error(ex);
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
