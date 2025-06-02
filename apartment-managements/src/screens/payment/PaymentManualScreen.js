import React, { useState } from "react";
import { View, Alert, Text, ActivityIndicator, ScrollView } from "react-native";
import { Button, TextInput, Card, Title, Paragraph } from "react-native-paper";
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { StyleSheet } from "react-native";

const PaymentManualScreen = ({ route }) => {
    const { billId, amount } = route.params || {};
    const [loading, setLoading] = useState(false);
    const [receipt, setReceipt] = useState(null);
    const [note, setNote] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleImagePicker = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled) {
                setReceipt(result);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
        }
    };

    const handleUpload = async () => {
        if (!receipt) {
            Alert.alert('Lỗi', 'Vui lòng chọn ảnh biên lai');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('receipt', {
                uri: receipt.uri,
                type: 'image/jpeg',
                name: 'receipt.jpg',
            });
            formData.append('bill_id', billId);
            formData.append('note', note);

            const response = await axios.post(
                `${API_BASE_URL}/api/payment/manual/`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        const progress = (progressEvent.loaded / progressEvent.total) * 100;
                        setUploadProgress(progress);
                    },
                }
            );

            if (response.data?.success) {
                Alert.alert(
                    'Thành công', 
                    'Biên lai đã được gửi. Vui lòng chờ xác nhận từ ban quản lý.',
                    [
                        { 
                            text: 'OK', 
                            onPress: () => navigation.goBack() 
                        }
                    ]
                );
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            let msg = 'Lỗi không xác định';
            if (error.response) {
                console.log('🔥 Lỗi từ server:', error.response.status, error.response.data);
                msg = `Lỗi server: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
            } else if (error.request) {
                console.log('⚠️ Không nhận được phản hồi từ server:', error.request);
                msg = 'Không nhận được phản hồi từ server';
            } else if (error.message) {
                console.log('❗ Message lỗi:', error.message);
                msg = error.message;
            }
            Alert.alert('Lỗi', msg);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    if (!billId || !amount) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Thiếu thông tin hóa đơn!</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.container}>
                <Card style={styles.card}>
                    <Card.Content>
                        <Title>Thông tin thanh toán</Title>
                        <Paragraph>Mã hóa đơn: {billId}</Paragraph>
                        <Paragraph>Số tiền: {amount?.toLocaleString()} VND</Paragraph>
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Content>
                        <Title>Hướng dẫn</Title>
                        <Paragraph>1. Chuyển khoản theo thông tin:</Paragraph>
                        <Paragraph style={styles.bankInfo}>
                            Ngân hàng: BIDV{'\n'}
                            Số tài khoản: 12345678{'\n'}
                            Tên: CÔNG TY QUẢN LÝ{'\n'}
                            Nội dung: HD{billId}
                        </Paragraph>
                        <Paragraph>2. Chụp biên lai chuyển khoản</Paragraph>
                        <Paragraph>3. Tải lên biên lai và điền ghi chú (nếu có)</Paragraph>
                    </Card.Content>
                </Card>

                <TextInput
                    mode="outlined"
                    label="Ghi chú (không bắt buộc)"
                    value={note}
                    onChangeText={setNote}
                    style={styles.input}
                    multiline
                />

                {receipt && (
                    <Text style={styles.selectedFile}>
                        Đã chọn: {receipt.uri.split('/').pop()}
                    </Text>
                )}

                {uploadProgress > 0 && uploadProgress < 100 && (
                    <Text style={styles.progress}>
                        Đang tải lên: {Math.round(uploadProgress)}%
                    </Text>
                )}

                <View style={styles.buttonContainer}>
                    <Button
                        mode="contained"
                        onPress={handleImagePicker}
                        style={styles.button}
                        disabled={loading}
                    >
                        Chọn biên lai
                    </Button>

                    <Button
                        mode="contained"
                        onPress={handleUpload}
                        style={styles.button}
                        loading={loading}
                        disabled={!receipt || loading}
                    >
                        Gửi biên lai
                    </Button>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    container: {
        padding: 16,
    },
    card: {
        marginBottom: 16,
    },
    bankInfo: {
        backgroundColor: '#e3f2fd',
        padding: 12,
        borderRadius: 4,
        marginVertical: 8,
    },
    input: {
        marginBottom: 16,
    },
    selectedFile: {
        marginBottom: 8,
        color: '#1976D2',
    },
    progress: {
        marginBottom: 8,
        color: '#2196F3',
    },
    buttonContainer: {
        gap: 8,
    },
    button: {
        marginBottom: 8,
    },
    errorText: {
        fontSize: 16,
        color: '#f44336',
        textAlign: 'center',
    },
});

export default PaymentManualScreen;
