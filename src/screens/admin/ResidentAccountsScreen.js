import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Surface, Text, Title, FAB, Portal, Modal, TextInput, Button, IconButton, useTheme, ActivityIndicator, Menu, Divider, Avatar } from 'react-native-paper';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';

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
      const response = await axios.get(`${API_BASE_URL}/residents/?page=${pageNumber}`);
      const { results, next } = response.data;
      
      if (shouldRefresh) {
        setResidents(results);
      } else {
        setResidents(prev => [...prev, ...results]);
      }
      
      setHasMore(!!next);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error fetching residents:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchResidents();
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

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/residents/`, formData);
      setModalVisible(false);
      setFormData({
        username: '',
        email: '',
        full_name: '',
        phone_number: '',
        apartment_id: '',
      });
      onRefresh();
    } catch (error) {
      console.error('Error creating resident:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLockAccount = async (residentId) => {
    try {
      await axios.post(`${API_BASE_URL}/residents/${residentId}/lock/`);
      onRefresh();
    } catch (error) {
      console.error('Error locking account:', error);
    }
  };

  const handleUnlockAccount = async (residentId) => {
    try {
      await axios.post(`${API_BASE_URL}/residents/${residentId}/unlock/`);
      onRefresh();
    } catch (error) {
      console.error('Error unlocking account:', error);
    }
  };

  const renderItem = ({ item }) => (
    <Surface style={styles.residentCard} elevation={2}>
      <View style={styles.residentHeader}>
        <View style={styles.residentInfo}>
          <Avatar.Text 
            size={40} 
            label={item.full_name.split(' ').map(n => n[0]).join('')} 
            style={{ backgroundColor: theme.colors.primary }}
          />
          <View style={styles.residentDetails}>
            <Title style={styles.residentName}>{item.full_name}</Title>
            <Text style={styles.residentUsername}>@{item.username}</Text>
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
              if (item.is_locked) {
                handleUnlockAccount(item.id);
              } else {
                handleLockAccount(item.id);
              }
              setMenuVisible(false);
            }} 
            title={item.is_locked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
            leadingIcon={item.is_locked ? "lock-open" : "lock"}
          />
          <Divider />
          <Menu.Item 
            onPress={() => {
              // TODO: Reset password
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
          <Text style={styles.infoLabel}>Số điện thoại:</Text>
          <Text style={styles.infoValue}>{item.phone_number}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Căn hộ:</Text>
          <Text style={styles.infoValue}>{item.apartment?.apartment_number || 'Chưa gán'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Trạng thái:</Text>
          <Text 
            style={[
              styles.statusBadge,
              { backgroundColor: item.is_locked ? '#F44336' : '#4CAF50' }
            ]}
          >
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
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={
          loading && !refreshing ? (
            <ActivityIndicator style={styles.loader} />
          ) : null
        }
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title style={styles.modalTitle}>Thêm cư dân mới</Title>
          
          <TextInput
            label="Tên đăng nhập"
            value={formData.username}
            onChangeText={(text) => setFormData({ ...formData, username: text })}
            style={styles.input}
            mode="outlined"
            autoCapitalize="none"
          />
          
          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            style={styles.input}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            label="Họ và tên"
            value={formData.full_name}
            onChangeText={(text) => setFormData({ ...formData, full_name: text })}
            style={styles.input}
            mode="outlined"
          />
          
          <TextInput
            label="Số điện thoại"
            value={formData.phone_number}
            onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
            style={styles.input}
            mode="outlined"
            keyboardType="phone-pad"
          />

          <TextInput
            label="Mã căn hộ"
            value={formData.apartment_id}
            onChangeText={(text) => setFormData({ ...formData, apartment_id: text })}
            style={styles.input}
            mode="outlined"
          />

          <View style={styles.modalActions}>
            <Button 
              mode="outlined" 
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
            >
              Hủy
            </Button>
            <Button 
              mode="contained" 
              onPress={handleSubmit}
              style={styles.modalButton}
              loading={loading}
            >
              Thêm
            </Button>
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
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
  },
  residentCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  residentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  residentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  residentDetails: {
    marginLeft: 12,
  },
  residentName: {
    fontSize: 16,
    lineHeight: 20,
  },
  residentUsername: {
    fontSize: 14,
    color: '#666',
  },
  residentBody: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    color: '#666',
  },
  infoValue: {
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    marginLeft: 8,
  },
  loader: {
    marginVertical: 16,
  },
});

export default ResidentAccountsScreen;
