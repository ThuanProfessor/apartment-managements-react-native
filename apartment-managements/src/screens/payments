import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../configs/API';
import { Checkbox } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from "../styles/BillListStyles";
import { SafeAreaView } from 'react-native-safe-area-context';
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

const BillListScreen = () => {
  const [bills, setBills] = useState([]);
  const [selectedBillId, setSelectedBillId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const navigation = useNavigation();

  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('access_token');
        const res = await API.get('/bills/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBills(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, []);

  const handleSelect = (billId) => {
    setSelectedBillId(billId === selectedBillId ? null : billId);
  };

  const filteredBills = bills.filter((item) => {
    const matchStatus =
      filter === 'all' ||
      (filter === 'paid' && item.status === 'paid') ||
      (filter === 'unpaid' && item.status !== 'paid');

    const allText =
      `${item.id} ${item.amount} ${item.status} ${item.bill_type} ${BILL_TYPE_VI[item.bill_type] || ''} ${item.due_date || ''}`
        .toLowerCase();

    const matchSearch = allText.includes(searchText.toLowerCase());

    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderBillItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.billItem,
        selectedBillId === item.id && styles.selectedBill,
      ]}
      onPress={() => handleSelect(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.row}>
        <MaterialCommunityIcons
          name="file-document-outline"
          size={32}
          color="#FFD600"
        />
        <Checkbox status={selectedBillId === item.id ? 'checked' : 'unchecked'} />
        <View style={styles.info}>
          <Text style={styles.label}>Mã: {item.id}</Text>
          <Text>Số tiền: {item.amount.toLocaleString()} đ</Text>
          <Text>
            Loại hóa đơn: {BILL_TYPE_VI[item.bill_type] || item.bill_type}
          </Text>
          <Text>
            Trạng thái:{' '}
            <Text style={{ color: getStatusColor(item.status) }}>
              {item.status}
            </Text>
          </Text>
          {item.due_date && (
            <Text>
              Hạn thanh toán: {new Date(item.due_date).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
     <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Danh sách hóa đơn của bạn</Text>

      {/* Bộ lọc + tìm kiếm */}
      <View style={styles.filterSearchWrapper}>
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.filterBtn,
                filter === f.value && styles.filterBtnActive,
              ]}
              onPress={() => {
                setFilter(f.value);
                setCurrentPage(1);
              }}
            >
              <Text
                style={{
                  color: filter === f.value ? '#fff' : '#007AFF',
                  fontWeight: 'bold',
                }}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          placeholder="🔍 Tìm kiếm theo bất kỳ thông tin..."
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
      </View>

      {/* Danh sách hóa đơn */}
      <FlatList
        data={paginatedBills}
        renderItem={renderBillItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 30 }}>
            Không có hóa đơn nào
          </Text>
        }
      />

      {/* Điều hướng trang */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={[
              styles.pageBtn,
              currentPage === 1 && styles.pageBtnDisabled,
            ]}
          >
            <Text style={styles.pageBtnText}>◀ Trước</Text>
          </TouchableOpacity>
          <Text style={{ alignSelf: 'center', marginHorizontal: 8 }}>
            Trang {currentPage} / {totalPages}
          </Text>
          <TouchableOpacity
            onPress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={[
              styles.pageBtn,
              currentPage === totalPages && styles.pageBtnDisabled,
            ]}
          >
            <Text style={styles.pageBtnText}>Tiếp ▶</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Thanh toán */}
      {selectedBillId && (() => {
        const bill = bills.find((b) => b.id === selectedBillId);
        if (bill && bill.status !== 'paid' && bill.status !== 'overdue') {
          return (
            <View style={styles.paymentBar}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#007AFF', marginRight: 12 }]}
                onPress={() => navigation.navigate('PaymentVnpay', { billId: selectedBillId })}
              >
                <Text style={styles.btnText}>Thanh toán VNPay</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#FFA000' }]}
                onPress={() => navigation.navigate('PaymentManual', {
                  billId: selectedBillId,
                  billType: bill.bill_type,
                  amount: bill.amount
                })}
              >
                <Text style={styles.btnText}>Thanh toán thủ công</Text>
              </TouchableOpacity>
            </View>
          );
        }
        return null;
      })()}
     </SafeAreaView>
  );
};

function getStatusColor(status) {
  switch (status) {
    case 'paid':
      return 'green';
    case 'pending':
      return 'orange';
    case 'overdue':
      return 'red';
    default:
      return 'black';
  }
}



export default BillListScreen;
