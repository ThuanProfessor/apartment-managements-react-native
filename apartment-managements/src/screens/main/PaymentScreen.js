import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Title, Modal } from 'react-native-paper';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
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
      const response = await axios.get(`${API_BASE_URL}/api/bills/unpaid/`);
      console.log('Unpaid bills:', response.data);
      setUnpaidBills(response.data?.results || response.data || []);
    } catch (error) {
      console.error('Error fetching unpaid bills:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBill = (bill) => {
    setSelectedBill(bill);
  };

  const handlePayment = async (bill, method) => {
    console.log(`Initiating payment with method: ${method}`);
    
    if (!bill?.id) {
      Alert.alert('Lỗi', 'Vui lòng chọn hóa đơn cần thanh toán');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/payment/create/`,
        {
          bill_id: bill.id,
          payment_method: method,
          language: 'vn',
          bank_code: method === 'vnpay' ? 'ncb' : undefined,
        }
      );

      if (response.data?.payment_url) {
        navigation.navigate('PaymentWebView', { 
          url: response.data.payment_url,
          billId: bill.id
        });
      } else if (method === 'momo') {
        // Show QR code for MoMo
        setSelectedBill(bill);
        setShowQRModal(true);
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
            <Card
              key={bill.id}
              style={styles.billCard}
              onPress={() => handleSelectBill(bill)}
            >
              <Card.Content>
                <View style={styles.billHeader}>
                  <MaterialCommunityIcons 
                    name="file-document-outline" 
                    size={24} 
                    color="#2196F3" 
                  />
                  <Title style={styles.billTitle}>
                    {bill.title || `Hóa đơn #${bill.id}`}
                  </Title>
                </View>
                
                <Text style={styles.amount}>
                  {bill.amount?.toLocaleString('vi-VN')} VNĐ
                </Text>
                
                {bill.due_date && (
                  <Text style={styles.dueDate}>
                    Hạn thanh toán: {new Date(bill.due_date).toLocaleDateString('vi-VN')}
                  </Text>
                )}

                <View style={styles.paymentMethods}>
                  <TouchableOpacity 
                    style={styles.methodButton}
                    onPress={() => handlePayment(bill, 'momo')}
                  >
                    <MaterialCommunityIcons 
                      name="qrcode-scan" 
                      size={32} 
                      color="#A50064" 
                    />
                    <Text style={styles.methodText}>MoMo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.methodButton}
                    onPress={() => handlePayment(bill, 'vnpay')}
                  >
                    <MaterialCommunityIcons 
                      name="credit-card" 
                      size={32} 
                      color="#004A9C" 
                    />
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
              source={require('../../assets/momo-qr.png')}
              style={styles.qrImage}
              resizeMode="contain"
            />
            <Text style={styles.qrText}>
              Mã hóa đơn: {selectedBill?.id}
            </Text>
            <Text style={styles.qrAmount}>
              Số tiền: {selectedBill?.amount?.toLocaleString('vi-VN')} VNĐ
            </Text>
            <Button
              mode="contained"
              onPress={() => {
                setShowQRModal(false);
                navigation.navigate('PaymentSuccess', { billId: selectedBill?.id });
              }}
              style={styles.confirmButton}
            >
              Xác nhận đã thanh toán
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
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
    color: '#1976D2',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  billCard: {
    marginBottom: 16,
    elevation: 2,
  },
  billHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  billTitle: {
    marginLeft: 8,
    fontSize: 18,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  dueDate: {
    color: '#666',
    marginBottom: 16,
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  methodButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    minWidth: 100,
  },
  methodText: {
    marginTop: 8,
    color: '#666',
    fontWeight: '600',
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
});

export default PaymentScreen;
