import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert } from 'react-native';
import { Button, Title } from 'react-native-paper';
import api, { endpoints } from '../../config/api';

const RelativeCardScreen = () => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');

  const handleSubmit = async () => {
    if (!name || !relationship) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ tên và mối quan hệ.');
      return;
    }

    try {
      const payload = {
        type: 'relative',
        name,
        relationship,
      };

      await api.post('/relative-cards/request_card/', payload);
      Alert.alert('Thành công', 'Đã gửi yêu cầu cấp thẻ người thân.');
      setName('');
      setRelationship('');
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể gửi yêu cầu. Vui lòng thử lại.');
    }
  };

  return (
    <View style={styles.container}>
      <Title>Đăng ký thẻ người thân</Title>

      <TextInput
        style={styles.input}
        placeholder="Họ và tên người thân"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Quan hệ (cha, mẹ, vợ/chồng...)"
        value={relationship}
        onChangeText={setRelationship}
      />

      <Button mode="contained" onPress={handleSubmit}>
        Gửi yêu cầu
      </Button>
    </View>
  );
};

export default RelativeCardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 20,
  },
});