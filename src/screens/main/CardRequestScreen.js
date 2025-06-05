//for User to request a relative card
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Alert,
  FlatList,
  Text,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button, Title, Card } from 'react-native-paper';
import api from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CardRequestScreen = () => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [cardRequests, setCardRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchCardRequests = async () => {
    try {
      setRefreshing(true);
      const token = await AsyncStorage.getItem('access_token');
      const res = await api.get('/card-requests/?type=relative', {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('📦 Danh sách yêu cầu:', res.data);
      const data = Array.isArray(res.data) ? res.data : res.data.results;
      setCardRequests(data);
    } catch (error) {
      console.error('❌ Lỗi tải yêu cầu:', error.response?.data || error.message);
      Alert.alert('Lỗi', 'Không thể tải danh sách yêu cầu.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !relationship.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ họ tên và quan hệ.');
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem('access_token');
      await api.post(
        '/relative-cards/request_card/',
        { type: 'relative', name, relationship },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Thành công', 'Đã gửi yêu cầu thẻ người thân.');
      setName('');
      setRelationship('');
      fetchCardRequests();
    } catch (error) {
      console.error('❌ Lỗi gửi yêu cầu:', error.response?.data || error.message);
      Alert.alert('Lỗi', 'Không thể gửi yêu cầu.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchCardRequests();
  }, []);

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved':
        return '✅ Đã duyệt';
      case 'pending':
        return '⏳ Đang chờ';
      case 'rejected':
        return '❌ Bị từ chối';
      default:
        return status;
    }
  };

  const getCardStyle = (status) => {
    switch (status) {
      case 'approved':
        return { borderLeftColor: '#4CAF50', borderLeftWidth: 5 };
      case 'pending':
        return { borderLeftColor: '#FFC107', borderLeftWidth: 5 };
      case 'rejected':
        return { borderLeftColor: '#F44336', borderLeftWidth: 5 };
      default:
        return {};
    }
  };

  const getStatusTextStyle = (status) => {
    switch (status) {
      case 'approved':
        return { color: '#4CAF50', fontWeight: 'bold' };
      case 'pending':
        return { color: '#FFC107', fontWeight: 'bold' };
      case 'rejected':
        return { color: '#F44336', fontWeight: 'bold' };
      default:
        return {};
    }
  };

  const renderItem = ({ item }) => (
    <Card style={[styles.card, getCardStyle(item.status)]}>
      <Card.Content>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSub}>👥 Quan hệ: {item.relationship || 'Không rõ'}</Text>
        <Text style={styles.cardSub}>📅 Ngày gửi: {new Date(item.created_date).toLocaleDateString('vi-VN')}</Text>
        <Text style={[styles.cardStatus, getStatusTextStyle(item.status)]}>
          {getStatusLabel(item.status)}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Title style={styles.sectionTitle}>Đăng ký thẻ người thân</Title>

        <TextInput
          style={styles.input}
          placeholder="Họ và tên người thân"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Quan hệ (cha, mẹ, vợ...)"
          value={relationship}
          onChangeText={setRelationship}
        />
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
          loading={submitting}
          disabled={submitting}
        >
          Gửi yêu cầu
        </Button>

        <Title style={styles.sectionTitle}>Danh sách yêu cầu đã gửi</Title>

        <FlatList
          data={cardRequests}
          keyExtractor={(item, index) => `${item.id || index}`}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchCardRequests} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có yêu cầu nào được gửi.</Text>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default CardRequestScreen;

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
    marginBottom: 10,
  },
  button: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 10,
    fontWeight: 'bold',
    fontSize: 18,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  cardStatus: {
    marginTop: 8,
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#777',
  },
});
