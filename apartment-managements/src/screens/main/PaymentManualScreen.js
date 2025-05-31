import React, { useState, useCallback } from 'react';
import {
  View, Image, ScrollView, Clipboard, Platform, StyleSheet, Alert
} from 'react-native';
import { Button, Text, Surface, Portal, Modal, ActivityIndicator, Snackbar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../../config/api';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PaymentManualScreen({ route, navigation }) {
  const { billId, amount, transferNote = `BILL${billId}` } = route?.params || {};
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const downloadQrImage = async () => {
    try {
      setLoading(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        showSnackbar('Ứng dụng cần quyền truy cập thư viện để lưu mã QR');
        return;
      }

      const remoteUri = Image.resolveAssetSource(require('../assets/images/qr-momo.png')).uri;
      const fileUri = FileSystem.documentDirectory + 'qr-momo.png';
      await FileSystem.downloadAsync(remoteUri, fileUri);
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync("QR Momo", asset, false);

      Alert.alert("✅ Thành công", "Đã lưu ảnh QR vào thư viện!");
    } catch (error) {
      console.error("Lỗi tải ảnh:", error);
      Alert.alert("❌ Thất bại", "Không thể tải ảnh. Hãy thử lại.");
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selected = result.assets[0];
      setImage({
        uri: selected.uri,
        name: selected.fileName || 'proof.jpg',
        type: selected.type || 'image/jpeg',
      });
    }
  };

  const uploadProof = async () => {
    if (!image) {
      Alert.alert("Vui lòng chọn ảnh trước");
      return;
    }

    const token = await AsyncStorage.getItem("access_token");
    if (!token) {
      Alert.alert("Lỗi", "Không tìm thấy access_token");
      return;
    }

    const formData = new FormData();
    formData.append("payment_proof", {
      uri: image.uri,
      name: image.name,
      type: image.type,
    });
    formData.append("payment_method", "momo_tranfer");

    setLoading(true);
    try {
      const res = await API.patch(
        `/bills/${billId}/upload_proof/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      Alert.alert("✅ Thành công", "Ảnh đã được tải lên. Chờ xác nhận.");
      setImage(null);
    } catch (err) {
      console.error("❌ Upload error:", err.response?.data || err.message);
      Alert.alert("Lỗi", "Không thể gửi ảnh lên. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    Alert.alert("Đã sao chép!", `"${text}" đã được sao chép.`);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.card}>
          <Text style={styles.title}>Thanh toán qua MoMo</Text>
          <Text style={styles.amount}>{amount?.toLocaleString('vi-VN')} VNĐ</Text>
          
          <Surface style={styles.qrContainer}>
            <Image
              source={require('../../assets/images/momo-qr.png')}
              style={styles.qrImage}
              resizeMode="contain"
            />
          </Surface>

          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>👤 Người nhận:</Text>
            <Text style={styles.infoValue}>DANG THE DANH</Text>
            
            <Text style={styles.infoLabel}>📱 Số điện thoại:</Text>
            <Text style={styles.infoValue}>0983414384</Text>
            
            <Text style={styles.infoLabel}>📝 Nội dung chuyển khoản:</Text>
            <View style={styles.noteRow}>
              <Text style={styles.infoValue}>{transferNote}</Text>
              <Button
                icon="content-copy"
                mode="text"
                onPress={() => {
                  Clipboard.setString(transferNote);
                  showSnackbar('Đã sao chép nội dung chuyển khoản');
                }}
              >
                Sao chép
              </Button>
            </View>
          </View>

          <Button
            mode="contained"
            onPress={downloadQrImage}
            style={styles.button}
            icon="qrcode-download"
            loading={loading}
          >
            Tải mã QR
          </Button>

          <Button
            mode="contained-tonal"
            onPress={pickImage}
            style={styles.button}
            icon="image-plus"
          >
            Chọn ảnh ủy nhiệm chi
          </Button>

          {image && (
            <Surface style={styles.imagePreviewContainer}>
              <Image source={{ uri: image.uri }} style={styles.previewImage} />
              <Button
                mode="contained"
                onPress={uploadProof}
                style={styles.uploadButton}
                loading={loading}
                icon="cloud-upload"
              >
                Gửi ảnh xác nhận
              </Button>
            </Surface>
          )}
        </Surface>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 10 }} />
      ) : (
        <TouchableOpacity style={paymentStyles.sendButton} onPress={uploadProof}>
          <Text style={paymentStyles.sendButtonText}>✅ Gửi ảnh</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
