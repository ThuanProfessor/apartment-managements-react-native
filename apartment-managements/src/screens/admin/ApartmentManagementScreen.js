import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Surface, Text, Title, FAB, Portal, Modal, TextInput, Button, IconButton, useTheme, ActivityIndicator } from 'react-native-paper';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';

const ApartmentManagementScreen = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const theme = useTheme();

  const [formData, setFormData] = useState({
    apartment_number: '',
    floor: '',
    block: '',
    area: '',
    status: 'available',
  });

  const fetchApartments = async (pageNumber = 1, shouldRefresh = false) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/apartments/?page=${pageNumber}`);
      const { results, next } = response.data;
      
      if (shouldRefresh) {
        setApartments(results);
      } else {
        setApartments(prev => [...prev, ...results]);
      }
      
      setHasMore(!!next);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error fetching apartments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApartments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchApartments(1, true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchApartments(page + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/apartments/`, formData);
      setModalVisible(false);
      setFormData({
        apartment_number: '',
        floor: '',
        block: '',
        area: '',
        status: 'available',
      });
      onRefresh();
    } catch (error) {
      console.error('Error creating apartment:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <Surface style={styles.apartmentCard} elevation={2}>
      <View style={styles.apartmentHeader}>
        <View>
          <Title style={styles.apartmentNumber}>Căn hộ {item.apartment_number}</Title>
          <Text style={styles.apartmentBlock}>Block {item.block} - Tầng {item.floor}</Text>
        </View>
        <IconButton
          icon="dots-vertical"
          onPress={() => {}}
        />
      </View>
      
      <View style={styles.apartmentDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Diện tích:</Text>
          <Text style={styles.detailValue}>{item.area} m²</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Trạng thái:</Text>
          <Text 
            style={[
              styles.statusBadge,
              { backgroundColor: item.status === 'available' ? '#4CAF50' : '#F44336' }
            ]}
          >
            {item.status === 'available' ? 'Trống' : 'Đã thuê'}
          </Text>
        </View>
      </View>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={apartments}
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
          <Title style={styles.modalTitle}>Thêm căn hộ mới</Title>
          
          <TextInput
            label="Số căn hộ"
            value={formData.apartment_number}
            onChangeText={(text) => setFormData({ ...formData, apartment_number: text })}
            style={styles.input}
            mode="outlined"
          />
          
          <TextInput
            label="Tầng"
            value={formData.floor}
            onChangeText={(text) => setFormData({ ...formData, floor: text })}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
          />
          
          <TextInput
            label="Block"
            value={formData.block}
            onChangeText={(text) => setFormData({ ...formData, block: text })}
            style={styles.input}
            mode="outlined"
          />
          
          <TextInput
            label="Diện tích (m²)"
            value={formData.area}
            onChangeText={(text) => setFormData({ ...formData, area: text })}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
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
  apartmentCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  apartmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  apartmentNumber: {
    fontSize: 18,
  },
  apartmentBlock: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  apartmentDetails: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#666',
  },
  detailValue: {
    fontWeight: 'bold',
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

export default ApartmentManagementScreen;
