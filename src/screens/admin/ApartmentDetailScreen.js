import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import api from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ApartmentDetailScreen = ({ route }) => {
  const { apartmentId } = route.params;
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResidents = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      const res = await api.get(`/apartments/${apartmentId}/residents/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResidents(res.data);
    } catch (error) {
      console.error('Lỗi khi tải cư dân:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, [apartmentId]);

  const renderResident = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.full_name}</Title>
        <Paragraph>Email: {item.email}</Paragraph>
        <Paragraph>Số điện thoại: {item.phone}</Paragraph>
        <Paragraph>Vai trò: {item.role}</Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Title style={styles.header}>Cư dân trong căn hộ</Title>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={residents}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderResident}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

export default ApartmentDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});