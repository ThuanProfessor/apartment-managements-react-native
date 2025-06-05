import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, FlatList, RefreshControl
} from 'react-native';
import {
  Surface, Text, Title, FAB, Portal, Modal, TextInput,
  Button, IconButton, useTheme, ActivityIndicator, Menu, Divider, Avatar
} from 'react-native-paper';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../config/api';

const ResidentAccountsScreen = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const theme = useTheme();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    phone_number: '',
    apartment_id: '',
  });

  const fetchResidents = async (pageNumber = 1, shouldRefresh = false) => {
  try {
    setLoading(true);
    const token = await AsyncStorage.getItem('access_token');
    const response = await api.get(`/users/?role=RESIDENT&page=${pageNumber}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { results, next } = response.data;

    const newList = shouldRefresh ? results : [...residents, ...results];
    const unique = Array.from(new Map(newList.map(r => [r.id, r])).values());

    setResidents(unique);
    setHasMore(!!next); 
    setPage(pageNumber);
  } catch (error) {
    const errMsg = error.response?.data?.detail;
    if (errMsg === 'Invalid page.') {
      console.warn('Không còn trang để tải');
      setHasMore(false);
    } else {
      console.error('Error fetching residents:', error.response?.data || error.message);
    }
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};


  useEffect(() => {
  const fetchData = async () => {
    const token = await AsyncStorage.getItem('access_token');
    const res = await api.get('/users/?role=RESIDENT', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('👤 Data cư dân:', res.data);
    setResidents(res.data?.results || res.data || []);
  };
  fetchData();
}, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchResidents(1, true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchResidents(page + 1);
    }
  };

  const handleToggleLock = async (resident) => {
    try {
      const reason = resident.is_locked ? '' : 'Khóa do quản trị viên yêu cầu';
      await axios.post(`${API_BASE_URL}/users/${resident.id}/toggle_lock/`, { reason }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      onRefresh();
    } catch (error) {
      console.error('Error toggling lock:', error);
    }
  };

  const handleSubmit = async () => {
  try {
    setLoading(true);
    const payload = {
      ...formData,
      role: 'RESIDENT'
    };

    await axios.post(`${API_BASE_URL}/users/`, payload);
    setModalVisible(false);
    setFormData({
      username: '',
      password: '', 
      email: '',
      full_name: '',
      phone_number: '',
      apartment_id: '',
    });
    onRefresh();
  } catch (error) {
    console.error('Error creating resident:', error.response?.data || error.message);
  } finally {
    setLoading(false);
  }
};

  const renderItem = ({ item }) => (
    <Surface style={styles.residentCard} elevation={2}>
      <View style={styles.residentHeader}>
        <View style={styles.residentInfo}>
          <Avatar.Text
            size={40}
            label={item.full_name ? item.full_name.split(' ').map(n => n[0]).join('') : 'NA'}
            style={{ backgroundColor: theme.colors.primary }}
          />
          <View style={styles.residentDetails}>
            <Title style={styles.residentName}>{item.full_name}</Title>
            <Text style={styles.username}>@{item.username}</Text>
          </View>
        </View>
        <Menu
          visible={menuVisible && selectedResident?.id === item.id}
          onDismiss={() => {
            setMenuVisible(false);
            setSelectedResident(null);
          }}
          anchor={
            <IconButton
              icon="dots-vertical"
              onPress={() => {
                setSelectedResident(item);
                setMenuVisible(true);
              }}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              handleToggleLock(item);
              setMenuVisible(false);
            }}
            title={item.is_locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
            leadingIcon={item.is_locked ? 'lock-open' : 'lock'}
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              // TODO: Đặt lại mật khẩu
              setMenuVisible(false);
            }}
            title="Đặt lại mật khẩu"
            leadingIcon="key"
          />
        </Menu>
      </View>

      <Divider />

      <View style={styles.residentBody}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{item.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📱 Số điện thoại:</Text>
          <Text style={styles.infoValue}>{item.phone || 'Chưa có'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🏠 Số căn hộ:</Text>
          <Text style={styles.infoValue}>{item.apartment_number || 'Chưa gán'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Trạng thái:</Text>
          <Text style={[styles.statusBadge, {
            backgroundColor: item.is_locked ? '#F44336' : '#4CAF50'
          }]}>
            {item.is_locked ? 'Đã khóa' : 'Hoạt động'}
          </Text>
        </View>
      </View>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={residents}
        renderItem={renderItem}
        keyExtractor={(item, index) => `resident-${item.id}-${index}`}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListFooterComponent={loading && !refreshing ? <ActivityIndicator /> : null}
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title style={styles.modalTitle}>Thêm cư dân mới</Title>
          {['username', 'email', 'full_name', 'phone_number', 'apartment_id'].map((field, index) => (
            <TextInput
              key={field}
              label={field.replace('_', ' ').toUpperCase()}
              value={formData[field]}
              onChangeText={(text) => setFormData({ ...formData, [field]: text })}
              style={styles.input}
              mode="outlined"
              autoCapitalize="none"
            />
          ))}
          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={() => setModalVisible(false)}>Hủy</Button>
            <Button mode="contained" onPress={handleSubmit} loading={loading}>Thêm</Button>
          </View>
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setModalVisible(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  listContent: { padding: 16 },
  residentCard: { marginBottom: 16, borderRadius: 12, backgroundColor: 'white' },
  residentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  residentInfo: { flexDirection: 'row', alignItems: 'center' },
  residentDetails: { marginLeft: 12 },
  residentName: { fontSize: 16 },
  username: {
  fontSize: 15,
  fontWeight: 'bold',
  color: 'darkblue',
  marginBottom: 6,
  textAlign: 'center',
},
  residentUsername: { fontSize: 14, color: '#666' },
  residentBody: { padding: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { color: '#666' },
  infoValue: { fontWeight: '500' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, color: 'white', fontSize: 12, fontWeight: 'bold' },
  fab: { position: 'absolute', right: 16, bottom: 16 },
  modalContent: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 12 },
  modalTitle: { textAlign: 'center', marginBottom: 20 },
  input: { marginBottom: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 8 }
});

export default ResidentAccountsScreen;
