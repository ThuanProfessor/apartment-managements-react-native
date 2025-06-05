import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert } from 'react-native';
import { Button, Text, Title } from 'react-native-paper';

import api from "../../config/api"; // API axios đã cấu hình

const ParkingCardScreen = () => {
  const [vehicleInfo, setVehicleInfo] = useState('');

  const handleRequest = async () => {
    try {
      const payload = {
        type: 'parking',
        name: vehicleInfo || 'Xe không tên',
      };

      const response = await api.post('/parking-cards/request_card/', payload);
      Alert.alert('Thành công', 'Yêu cầu thẻ gửi xe đã được gửi!');
      setVehicleInfo('');
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể gửi yêu cầu. Vui lòng thử lại.');
    }
  };

  return (
    <View style={styles.container}>
      <Title>Đăng ký thẻ gửi xe</Title>
      <TextInput
        style={styles.input}
        placeholder="Nhập thông tin xe (biển số, loại xe...)"
        value={vehicleInfo}
        onChangeText={setVehicleInfo}
      />
      <Button mode="contained" onPress={handleRequest}>
        Gửi yêu cầu
      </Button>
    </View>
  );
};

export default ParkingCardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 20,
  },
});
