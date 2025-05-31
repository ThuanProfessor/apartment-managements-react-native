
import { useNavigation } from "@react-navigation/native";
import api, { API_ENDPOINTS } from "../../config/api";
import React, { useEffect, useState } from "react";
import { Chip } from "react-native-paper";
import { StyleSheet } from "react-native";

import { SafeAreaView, View, Text, Button } from "react-native";
const Home = () => {
  const [apartments, setApartments] = useState([]);
  const navigation = useNavigation();

  const loadApartments = async () => {
    let res = await API.get(endpoints.apartments);
    setApartments(res.data);
  };

  useEffect(() => {
    loadApartments();
  }, []);
return (
    <SafeAreaView>
      <View>
        <Button
          title="Thông tin bill"
          onPress={() => navigation.navigate("BillList")}
        />
          <Button
        title="Tủ đồ"
        onPress={() => navigation.navigate("Locker")}
      />
      </View>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  chip: {
    margin: 4,
  },
});
