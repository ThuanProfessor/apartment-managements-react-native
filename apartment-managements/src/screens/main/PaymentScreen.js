import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Title, Modal } from 'react-native-paper';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const PaymentScreen = ({ navigation }) => {
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    fetchUnpaidBills();
  }, []);

  const fetchUnpaidBills = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        navigation.replace('Login');
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.BILLS}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      const billsData = response.data?.results || response.data || [];
      const unpaidBillsData = billsData.filter(bill => bill.status === 'pending');
      setUnpaidBills(unpaidBillsData);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBill = (bill) => {
    setSelectedBill(bill);
  };

  const handlePayment = async (bill, method) => {
    try {
      if (method === 'momo') {
        // Show QR code for MoMo
        setSelectedBill(bill);
        setShowQRModal(true);
        return;
      }

      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        navigation.replace('Login');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.PAYMENTS}`,
        {
          bill_id: bill.id,
          payment_method: method,
          language: 'vn',
          bank_code: method === 'vnpay' ? 'ncb' : undefined,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      if (response.data?.payment_url) {
        navigation.navigate('PaymentWebView', { 
          url: response.data.payment_url,
          billId: bill.id
        });
      } else {
        throw new Error('Không nhận được URL thanh toán');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Lỗi', 
        error.response?.data?.message || 
        error.message || 
        'Không thể tạo giao dịch thanh toán'
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Thanh toán hóa đơn</Title>

      {unpaidBills.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="check-circle" size={64} color="#4CAF50" />
          <Text style={styles.emptyText}>Không có hóa đơn cần thanh toán</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {unpaidBills.map((bill) => (
            <Card key={bill.id} style={styles.billCard}>
              <Card.Content>
                <View style={styles.billHeader}>
                  <MaterialCommunityIcons name="file-document-outline" size={24} color="#2196F3" />
                  <View style={styles.billInfo}>
                    <Title style={styles.billTitle}>{bill.title || `Hóa đơn #${bill.id}`}</Title>
                    <Text style={styles.amount}>{bill.amount?.toLocaleString('vi-VN')} VNĐ</Text>
                    {bill.due_date && (
                      <Text style={styles.dueDate}>
                        Hạn thanh toán: {new Date(bill.due_date).toLocaleDateString('vi-VN')}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.paymentMethods}>
                  <TouchableOpacity 
                    style={[styles.methodButton, styles.momoButton]}
                    onPress={() => handlePayment(bill, 'momo')}
                  >
                    <MaterialCommunityIcons name="qrcode-scan" size={32} color="#FFFFFF" />
                    <Text style={styles.methodText}>MoMo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.methodButton, styles.vnpayButton]}
                    onPress={() => handlePayment(bill, 'vnpay')}
                  >
                    <MaterialCommunityIcons name="credit-card" size={32} color="#FFFFFF" />
                    <Text style={styles.methodText}>VNPay</Text>
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )}

      <Modal
        visible={showQRModal}
        onDismiss={() => setShowQRModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.qrCard}>
          <Card.Content>
            <Title style={styles.qrTitle}>Quét mã QR MoMo</Title>
            <Image
              source={require('../../../assets/images/momo-qr.png')}
              style={styles.qrImage}
              resizeMode="contain"
            />
            <Text style={styles.qrText}>
              Mã hóa đơn: {selectedBill?.id}
            </Text>
            <Text style={styles.qrAmount}>
              Số tiền: {selectedBill?.amount?.toLocaleString('vi-VN')} VNĐ
            </Text>
            <Text style={styles.accountDetails}>
              <Text style={styles.label}>Chủ tài khoản: </Text>DANG THE DANH{'\n'}
              <Text style={styles.label}>Số điện thoại: </Text>0983414384{'\n'}
              <Text style={styles.label}>Nội dung: </Text>BILL{selectedBill?.id}
            </Text>
            <Button
              mode="contained"
              onPress={() => setShowQRModal(false)}
              style={styles.confirmButton}
            >
              Đóng
            </Button>
          </Card.Content>
        </Card>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    color: '#1976D2',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  billCard: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: '#FFFFFF',
  },
  billHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  billInfo: {
    marginLeft: 12,
    flex: 1,
  },
  billTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginTop: 4,
  },
  dueDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  methodButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  momoButton: {
    backgroundColor: '#A50064',
  },
  vnpayButton: {
    backgroundColor: '#004A9C',
  },
  methodText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalContainer: {
    padding: 20,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  qrCard: {
    elevation: 4,
  },
  qrTitle: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#1976D2',
  },
  qrImage: {
    width: '100%',
    height: 300,
    marginBottom: 16,
  },
  qrText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 8,
  },
  qrAmount: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 24,
  },
  confirmButton: {
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  accountDetails: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
  },
});

export default PaymentScreen;
