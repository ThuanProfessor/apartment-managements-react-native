import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Alert, ScrollView, RefreshControl } from 'react-native';
import { Button, Card, Text, Title, Portal, Modal, ActivityIndicator, Banner } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { WebView } from 'react-native-webview';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, getHeaders } from '../../config/api';

const PaymentsScreen = () => {
  const { user } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [showWebView, setShowWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [payments, setPayments] = useState([]);
  const [visible, setVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.PAYMENTS}`,
        { headers: getHeaders(user?.token) }
      );
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodSelect = async (method) => {
    try {
      setLoading(true);
      setError(null);
      
      // Here you would make an API call to get the payment URL
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.PAYMENTS}/init/`,
        {
          payment_id: selectedPayment.id,
          payment_method: method,
          amount: selectedPayment.amount,
          return_url: `${API_BASE_URL}/payment/callback/`,
        },
        { headers: getHeaders(user?.token) }
      );

      if (!response.data.payment_url) {
        throw new Error('Failed to create payment');
      }

      setSelectedPaymentMethod(method);
      setPaymentUrl(response.data.payment_url);
      setShowWebView(true);
    } catch (err) {
      setError('Failed to initiate payment. Please try again.');
      Alert.alert('Error', 'Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadReceipt = async () => {
    try {
      setLoading(true);
      setError(null);
      setUploadProgress(0);

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Camera roll permission is required');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.cancelled) {
        // Create form data for upload
        const formData = new FormData();
        formData.append('receipt', {
          uri: result.uri,
          type: 'image/jpeg',
          name: 'receipt.jpg',
        });
        formData.append('paymentId', selectedPayment.id);

        // Upload to server with progress tracking
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setUploadProgress(progress);
          }
        });

        xhr.upload.addEventListener('load', () => {
          setUploadProgress(100);
          setBannerMessage('Receipt uploaded successfully');
          setShowBanner(true);
          setTimeout(() => setShowBanner(false), 3000);
        });

        xhr.upload.addEventListener('error', () => {
          throw new Error('Upload failed');
        });

        xhr.open('POST', `${API_BASE_URL}${API_ENDPOINTS.PAYMENTS}/upload-receipt/`, true);
        xhr.setRequestHeader('Authorization', `Bearer ${user.token}`);
        xhr.send(formData);
      }
    } catch (error) {
      console.error('Error uploading receipt:', error);
      setError('Failed to upload receipt. Please try again.');
      Alert.alert('Error', 'Failed to upload receipt');
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewNavigationStateChange = useCallback((newNavState) => {
    const { url } = newNavState;
    if (url.includes('success')) {
      setShowWebView(false);
      setBannerMessage('Payment completed successfully');
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    } else if (url.includes('cancel')) {
      setShowWebView(false);
      setError('Payment was cancelled');
    } else if (url.includes('error')) {
      setShowWebView(false);
      setError('Payment failed. Please try again.');
      Alert.alert('Error', 'Payment failed. Please try again.');
    }
  }, []);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      // Fetch latest payment history
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.PAYMENTS}`,
        { headers: getHeaders(user?.token) }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch payment history');
      }
      // Update payment history state here
      setPayments(response.data);
    } catch (error) {
      setError('Failed to refresh payment history');
    } finally {
      setRefreshing(false);
    }
  }, [user.id]);

  const handlePayment = (payment) => {
    setSelectedPayment(payment);
    setVisible(true);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Banner
        visible={showBanner}
        actions={[{ label: 'Dismiss', onPress: () => setShowBanner(false) }]}
      >
        {bannerMessage}
      </Banner>

      {error && (
        <Banner
          visible={true}
          actions={[{ label: 'Dismiss', onPress: () => setError(null) }]}
          style={styles.errorBanner}
        >
          {error}
        </Banner>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Title>Select Payment Method</Title>
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => handlePaymentMethodSelect('momo')}
              style={styles.button}
              loading={loading && selectedPaymentMethod === 'momo'}
              disabled={loading}
            >
              MoMo
            </Button>
            <Button
              mode="contained"
              onPress={() => handlePaymentMethodSelect('vnpay')}
              style={styles.button}
              loading={loading && selectedPaymentMethod === 'vnpay'}
              disabled={loading}
            >
              VNPay
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Upload Payment Receipt</Title>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <View style={styles.progressContainer}>
              <Text>Uploading: {Math.round(uploadProgress)}%</Text>
              <ActivityIndicator animating={true} />
            </View>
          )}
          <Button
            mode="contained"
            onPress={handleUploadReceipt}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            Upload Receipt
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Title>Payment Summary</Title>
          <Paragraph>Current Month: {new Date().toLocaleString('default', { month: 'long' })}</Paragraph>
        </Card.Content>
      </Card>

      <View style={styles.paymentsList}>
        <Title style={styles.sectionTitle}>Pending Payments</Title>
        {payments.map((payment, index) => (
          <Card key={index} style={styles.paymentCard}>
            <Card.Content>
              <Title>{payment.type}</Title>
              <Paragraph>Amount: {payment.amount.toLocaleString()} VND</Paragraph>
              <Paragraph>Due Date: {payment.dueDate}</Paragraph>
              <Button
                mode="contained"
                onPress={() => handlePayment(payment)}
                style={styles.button}
              >
                Pay Now
              </Button>
            </Card.Content>
          </Card>
        ))}
      </View>

      <View style={styles.paymentsList}>
        <Title style={styles.sectionTitle}>Payment History</Title>
        <List.Section>
          {payments
            .filter(payment => payment.status === 'paid')
            .map((payment, index) => (
              <List.Item
                key={index}
                title={payment.type}
                description={`Paid on ${payment.paidDate}`}
                left={props => <List.Icon {...props} icon="check-circle" />}
              />
            ))}
        </List.Section>
      </View>

      {renderPaymentModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  errorBanner: {
    backgroundColor: '#ffebee',
    marginBottom: 10,
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  webviewModal: {
    flex: 1,
    backgroundColor: 'white',
    margin: 0, // Full screen for payment gateway
  },
  webview: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  summaryCard: {
    margin: 16,
    elevation: 4,
  },
  paymentsList: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  paymentCard: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  paymentButton: {
    marginTop: 16,
    marginHorizontal: 0,
  },
});

export default PaymentsScreen;
