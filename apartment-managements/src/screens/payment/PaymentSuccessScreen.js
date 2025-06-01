import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const PaymentSuccessScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons 
        name="check-circle" 
        size={100} 
        color="#4CAF50" 
      />
      
      <Text style={styles.title}>Thanh toán thành công!</Text>
      <Text style={styles.subtitle}>
        Cảm ơn bạn đã thanh toán. Hóa đơn của bạn đã được cập nhật.
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Bills')}
          style={styles.button}
          icon="file-document"
        >
          Xem hóa đơn
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Home')}
          style={styles.button}
        >
          Về trang chủ
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    marginBottom: 12,
  },
});

export default PaymentSuccessScreen;
