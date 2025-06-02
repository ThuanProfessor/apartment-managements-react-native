import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Chip, Title } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import axios from 'axios';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const BILL_TYPE_VI = {
  management_fee: 'Phí quản lý',
  parking_fee: 'Phí gửi xe',
  service_fee: 'Phí dịch vụ',
};

const FILTERS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chưa thanh toán', value: 'unpaid' },
  { label: 'Đã thanh toán', value: 'paid' },
];

const BillListScreen = ({ navigation }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchBills = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        navigation.replace('Login');
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.BILLS}`
      );
      
      console.log('Bills API Response:', response.data);
      
      // Ensure we have an array of bills
      const billsData = response.data?.results || response.data || [];
      if (!Array.isArray(billsData)) {
        console.error('Bills data is not an array:', billsData);
        setBills([]);
        return;
      }
      
      setBills(billsData);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBills();
  };



  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return '#4CAF50';
      case 'pending':
        return '#FFC107';
      default:
        return '#F44336';
    }
  };

  const filteredBills = Array.isArray(bills) ? bills.filter((item) => {
    const matchStatus =
      filter === 'all' ||
      (filter === 'paid' && item.status === 'paid') ||
      (filter === 'unpaid' && item.status !== 'paid');

    const searchLower = searchText.toLowerCase();
    const matchSearch =
      item.id.toString().includes(searchLower) ||
      (item.title || '').toLowerCase().includes(searchLower) ||
      (item.bill_type || '').toLowerCase().includes(searchLower) ||
      (BILL_TYPE_VI[item.bill_type] || '').toLowerCase().includes(searchLower);

    return matchStatus && matchSearch;
  }) : [];

  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderBillItem = ({ item }) => (
    <Card style={styles.card} mode="outlined">
      <Card.Content>
        <View style={styles.headerRow}>
          <MaterialCommunityIcons name="file-document-outline" size={24} color="#2196F3" />
          <Text variant="titleMedium" style={styles.title}>
            {item.title || `Hóa đơn #${item.id}`}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text variant="bodyMedium" style={styles.amount}>
            {item.amount?.toLocaleString('vi-VN')} VNĐ
          </Text>
          <Chip
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={{ color: 'white' }}
          >
            {item.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
          </Chip>
        </View>

        <Text variant="bodySmall" style={styles.billType}>
          Loại: {BILL_TYPE_VI[item.bill_type] || item.bill_type}
        </Text>

        {item.due_date && (
          <Text variant="bodySmall" style={styles.dueDate}>
            Hạn thanh toán: {new Date(item.due_date).toLocaleDateString('vi-VN')}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Đang tải hóa đơn...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Title style={styles.screenTitle}>Danh sách hóa đơn</Title>

      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[styles.filterBtn, filter === f.value && styles.filterBtnActive]}
              onPress={() => {
                setFilter(f.value);
                setCurrentPage(1);
              }}
            >
              <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          placeholder="🔍 Tìm kiếm hóa đơn..."
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            setCurrentPage(1);
          }}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={paginatedBills}
        renderItem={renderBillItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="file-search" size={48} color="#9E9E9E" />
            <Text style={styles.emptyText}>Không tìm thấy hóa đơn nào</Text>
          </View>
        }
      />

      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
          >
            <Text style={styles.pageBtnText}>◀ Trước</Text>
          </TouchableOpacity>

          <Text style={styles.pageText}>
            Trang {currentPage} / {totalPages}
          </Text>

          <TouchableOpacity
            onPress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
          >
            <Text style={styles.pageBtnText}>Tiếp ▶</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
    color: '#1976D2',
  },
  filterContainer: {
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  filterBtnActive: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  filterTextActive: {
    color: 'white',
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#2196F3',
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    marginLeft: 8,
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  statusChip: {
    borderRadius: 16,
  },
  billType: {
    marginBottom: 4,
    color: '#616161',
  },
  dueDate: {
    marginBottom: 12,
    color: '#616161',
  },
  button: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 8,
    color: '#9E9E9E',
    fontSize: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  pageBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2196F3',
  },
  pageBtnDisabled: {
    backgroundColor: '#BDBDBD',
  },
  pageBtnText: {
    color: 'white',
    fontWeight: '600',
  },
  pageText: {
    marginHorizontal: 16,
    fontSize: 16,
    color: '#616161',
  },
});

export default BillListScreen;
