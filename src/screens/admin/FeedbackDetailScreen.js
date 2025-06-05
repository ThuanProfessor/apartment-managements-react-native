import React from 'react';
import { View, Text, Alert, StyleSheet, ScrollView } from 'react-native';
import api from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from 'react-native-paper';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';

const FeedbackDetailScreen = ({ route, navigation }) => {
  const { feedback } = route.params;
  const { width } = useWindowDimensions();

  const handleResolve = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      await api.patch(`/feedbacks/${feedback.id}/resolve/`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert('✅ Thành công', 'Phản ánh đã được đánh dấu là đã xử lý');
      navigation.goBack();
    } catch (error) {
      console.error(error.response?.data || error.message);
      Alert.alert('❌ Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Chi tiết phản ánh</Text>

      <Text style={styles.label}>📌 Danh mục:</Text>
      <Text style={styles.value}>{feedback.category || 'Không có'}</Text>

      <Text style={styles.label}>📝 Nội dung:</Text>
      <RenderHtml
        contentWidth={width}
        source={{ html: feedback.content || '' }}
      />

      <Text style={styles.label}>📍 Trạng thái:</Text>
      <Text style={[styles.value, { color: feedback.status === 'resolved' ? 'green' : 'orange' }]}>
        {feedback.status}
      </Text>

      {feedback.status !== 'resolved' && (
        <Button
          mode="contained"
          onPress={handleResolve}
          style={styles.button}
          buttonColor="#4CAF50"
        >
          Đánh dấu đã xử lý
        </Button>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    marginTop: 16,
    fontWeight: 'bold',
    fontSize: 15,
  },
  value: {
    marginTop: 4,
    fontSize: 16,
  },
  button: {
    marginTop: 24,
    padding: 8,
    borderRadius: 8,
  },
});

export default FeedbackDetailScreen;
