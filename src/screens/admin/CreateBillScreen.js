import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import api from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreateBillScreen = () => {
  const [managementFee, setManagementFee] = useState('500000');
  const [serviceFee, setServiceFee] = useState('200000');
  const [parkingFee, setParkingFee] = useState('300000');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn tạo hóa đơn tháng này với các mức phí đã nhập?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Tạo hóa đơn',
          onPress: async () => {
            try {
              setLoading(true);
              const token = await AsyncStorage.getItem('access_token');
              const res = await api.post(
                '/users/create_monthly_bills/',
                {
                  management_fee: parseInt(managementFee),
                  service_fee: parseInt(serviceFee),
                  parking_fee: parseInt(parkingFee),
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              Alert.alert('✅ Thành công', res.data.message || 'Đã tạo hóa đơn.');
            } catch (error) {
              console.error('Lỗi tạo hóa đơn:', error.response?.data || error.message);
              Alert.alert('❌ Lỗi', 'Không thể tạo hóa đơn.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Phí quản lý (VNĐ):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={managementFee}
        onChangeText={setManagementFee}
      />

      <Text style={styles.label}>Phí dịch vụ khác (VNĐ):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={serviceFee}
        onChangeText={setServiceFee}
      />

      <Text style={styles.label}>Phí gửi xe (VNĐ):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={parkingFee}
        onChangeText={setParkingFee}
      />

      <Button
        title={loading ? 'Đang xử lý...' : '📄 Tạo hóa đơn tháng này'}
        color="#27ae60"
        onPress={handleSubmit}
        disabled={loading}
      />
    </View>
  );
};

export default CreateBillScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f4f8',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 16,
    color: '#2c3e50',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
});
