import React from 'react';
import { WebView } from 'react-native-webview';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

const PaymentWebView = ({ route, navigation }) => {
  const { url, billId } = route.params;

  const handleNavigationStateChange = (navState) => {
    // Kiểm tra URL callback từ cổng thanh toán
    if (navState.url.includes('payment_success')) {
      navigation.replace('PaymentSuccess', { billId });
    } else if (navState.url.includes('payment_cancel')) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: url }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#2196F3" />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PaymentWebView;
