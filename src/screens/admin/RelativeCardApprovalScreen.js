import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Surface, Text, Title, Button, Avatar, useTheme, ActivityIndicator, Divider } from 'react-native-paper';
import api from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RelativeCardApprovalScreen = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      const res = await api.get('/card-requests/?type=relative', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data.results || res.data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const endpoint = `/card-requests/${id}/${status === 'approved' ? 'approve' : 'reject'}/`;

    await api.patch(endpoint, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchRequests(); // Refresh lại danh sách
  } catch (error) {
    console.error(error.response?.data || error.message);
    Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
  }
};

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFA000';
      case 'approved': return '#4CAF50';
      case 'rejected': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const renderItem = ({ item }) => (
    <Surface style={styles.card} elevation={3}>
      <View style={styles.headerRow}>
        <Avatar.Text
          size={48}
          label={item.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          style={{ backgroundColor: theme.colors.primary }}
        />
        <View style={styles.infoContainer}>
          <Title>{item.name}</Title>
          <Text>Quan hệ: {item.relationship}</Text>
          <Text>Người yêu cầu: {item.user_name}</Text>
        </View>
      </View>

      <Divider style={{ marginVertical: 8 }} />

      <View style={styles.statusRow}>
        <Text style={[styles.statusText, { backgroundColor: getStatusColor(item.status) }]}>
          {item.status === 'pending' ? '⏳ Đang chờ' : item.status === 'approved' ? '✅ Đã duyệt' : '❌ Từ chối'}
        </Text>

        {item.status === 'pending' && (
          <View style={styles.actions}>
            <Button
              mode="contained"
              icon="check"
              onPress={() => updateStatus(item.id, 'approved')}
              style={styles.actionButton}
            >
              Duyệt
            </Button>
            <Button
              mode="outlined"
              icon="close"
              onPress={() => updateStatus(item.id, 'rejected')}
              style={styles.actionButton}
              textColor="#F44336"
            >
              Từ chối
            </Button>
          </View>
        )}
      </View>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <Title style={styles.pageTitle}>Duyệt thẻ người thân</Title>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
};

export default RelativeCardApprovalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContainer: {
    marginLeft: 12,
    flex: 1,
  },
  statusRow: {
    marginTop: 8,
  },
  statusText: {
    alignSelf: 'flex-start',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },
  actionButton: {
    marginRight: 10,
  },
});
