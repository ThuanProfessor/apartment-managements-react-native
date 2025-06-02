import React, { useState } from "react";
import { View, Button, Alert, Text, ActivityIndicator } from "react-native";
// import InAppBrowser from "react-native-inappbrowser-reborn";
import { Linking } from 'react-native';
import api from "../../config/api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../../styles/styles';
const PaymentVnpayScreen = ({ route }) => {
    const { billId } = route.params || {};
    const [loading, setLoading] = useState(false);

    const handleVnpay = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('access_token');
            console.log("token", token);
            const response = await api.post(
                "/api/payment/create/",
                {
                    bill_id: billId,
                    language: "vn",
                    bank_code: "ncb",
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",

                    }
                }
            );
            const data = response.data;
            console.log("response.data", data);
            if (data.payment_url) {
                const supported = await Linking.canOpenURL(data.payment_url);
                if (supported) {
                    await Linking.openURL(data.payment_url);
                } else {
                    Alert.alert("Thiết bị không hỗ trợ mở URL.");
                }
            } else {
                Alert.alert("Không lấy được link thanh toán");
            }
        } catch (error) {
            let msg = "Lỗi không xác định";
            if (error.response) {
                console.log("🔥 Lỗi từ server:", error.response.status, error.response.data);
                msg = `Server: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
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
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Thiếu billId!</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ marginBottom: 16 }}>Thanh toán VNPay</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#2196f3" />
            ) : (
                <Button title="Thanh toán VNPay" onPress={handleVnpay} />
            )}
        </View>
    );
};

export default PaymentVnpayScreen;