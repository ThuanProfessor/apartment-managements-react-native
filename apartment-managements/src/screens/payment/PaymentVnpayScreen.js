import React, { useState } from "react";
import { View, Alert, Text, ActivityIndicator } from "react-native";
import { Button } from "react-native-paper";
import { Linking } from 'react-native';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet } from "react-native";

const PaymentVnpayScreen = ({ route, navigation }) => {
    const { billId } = route.params || {};
    const [loading, setLoading] = useState(false);

    const handleVnpay = async () => {
        setLoading(true);
        try {
            console.log("Initiating VNPay payment for bill:", billId);
            const token = await AsyncStorage.getItem('access_token');
            if (!token) {
                navigation.replace('Login');
                return;
            }

            const response = await axios.post(
                `${API_BASE_URL}${API_ENDPOINTS.PAYMENTS}`,
                {
                    bill_id: billId,
                    language: "vn",
                    bank_code: "ncb",
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );
            
            console.log("VNPay response:", response.data);
            
            if (response.data?.payment_url) {
                const supported = await Linking.canOpenURL(response.data.payment_url);
                if (supported) {
                    await Linking.openURL(response.data.payment_url);
                } else {
                    Alert.alert("Lỗi", "Thiết bị không hỗ trợ mở URL thanh toán");
                }
            } else {
                Alert.alert("Lỗi", "Không lấy được link thanh toán");
            }
        } catch (error) {
            let msg = "Lỗi không xác định";
            if (error.response) {
                console.log("🔥 Lỗi từ server:", error.response.status, error.response.data);
                msg = `Lỗi server: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
            } else if (error.request) {
                console.log("⚠️ Không nhận được phản hồi từ server:", error.request);
                msg = "Không nhận được phản hồi từ server";
            } else if (error.message) {
                console.log("❗ Message lỗi:", error.message);
                msg = error.message;
            }
            Alert.alert("Lỗi", msg);
        } finally {
            setLoading(false);
        }
    };

    if (!billId) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Thiếu thông tin hóa đơn!</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Thanh toán VNPay</Text>
            <Text style={styles.subtitle}>Mã hóa đơn: {billId}</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#2196F3" />
            ) : (
                <Button 
                    mode="contained"
                    onPress={handleVnpay}
                    style={styles.button}
                >
                    Thanh toán qua VNPay
                </Button>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1976D2',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 24,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#f44336',
        textAlign: 'center',
    },
    button: {
        marginTop: 16,
        paddingHorizontal: 32,
    }
});

export default PaymentVnpayScreen;
