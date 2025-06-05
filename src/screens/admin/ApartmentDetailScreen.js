import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, ActivityIndicator, Avatar, Chip } from 'react-native-paper';
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
    <Card style={styles.card} elevation={2}>
      <Card.Content style={styles.cardContent}>
        <Avatar.Text
          size={48}
          label={item.full_name ? item.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'NA'}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <Title style={styles.name}>{item.full_name}</Title>
          <Paragraph style={styles.detail}>📧 {item.email || 'Không có email'}</Paragraph>
          <Paragraph style={styles.detail}>📱 {item.phone || 'Không có số'}</Paragraph>
          <Chip style={[styles.roleChip, item.role === 'RESIDENT' ? styles.resident : styles.admin]}>
            {item.role === 'RESIDENT' ? 'Cư dân' : 'Quản trị viên'}
          </Chip>
        </View>
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
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
    backgroundColor: '#6200ee',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detail: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  roleChip: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  resident: {
    backgroundColor: '#4CAF50',
  },
  admin: {
    backgroundColor: '#FF5722',
  },
});
