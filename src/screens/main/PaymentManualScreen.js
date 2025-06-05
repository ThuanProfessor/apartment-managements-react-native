import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Clipboard
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { API_ENDPOINTS } from "../../config/api";
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import paymentStyles from '../../styles/paymentManualStyles';

export default function PaymentManualScreen({ route }) {
  const { billId, amount, transferNote = `BILL${billId}` } = route?.params || {};
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const downloadQrImage = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("⚠️ Không có quyền", "Ứng dụng cần quyền truy cập thư viện.");
        return;
      }

      const remoteUri = Image.resolveAssetSource(require('../../../assets/images/qr-momo.png')).uri;
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
      const res = await api.patch(
        API_ENDPOINTS.BILL_UPLOAD_PROOF(billId),
        formData,
        {
          headers: {
            // "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("✅ Thành công", "Ảnh đã được tải lên. Chờ xác nhận.");
      setImage(null);
    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
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
    <ScrollView contentContainerStyle={paymentStyles.container}>
      <Text style={paymentStyles.name}>DANG THE DANH</Text>
      <Text style={paymentStyles.phone}>0983414384</Text>

      <View style={paymentStyles.amountBox}>
        <Text style={paymentStyles.amountLabel}>💰 Số tiền cần chuyển:</Text>
        <Text style={paymentStyles.amountValue}>{amount?.toLocaleString('vi-VN')}₫</Text>
      </View>

      <View style={paymentStyles.noteBox}>
        <Text style={paymentStyles.noteLabel}>📝 Nội dung chuyển khoản:</Text>
        <View style={paymentStyles.noteRow}>
          <Text style={paymentStyles.noteValue}>{transferNote}</Text>
          <TouchableOpacity onPress={() => copyToClipboard(transferNote)}>
            <Text style={paymentStyles.copyBtn}>📋</Text>
          </TouchableOpacity>
        </View>
        <Text style={paymentStyles.warning}>⚠️ Vui lòng ghi đúng nội dung chuyển khoản để được xác nhận tự động.</Text>
      </View>

      <View style={paymentStyles.qrContainer}>
        <TouchableOpacity onPress={downloadQrImage}>
          <Image
            source={require('../../../assets/images/qr-momo.png')}
            style={paymentStyles.qrImage}
            resizeMode="contain"
          />
          <Text style={{ textAlign: 'center', fontSize: 12, marginTop: 4, color: '#555' }}>
            📥 Nhấn để lưu ảnh QR về máy
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={paymentStyles.chooseButton} onPress={pickImage}>
        <Text style={paymentStyles.chooseButtonText}>📤 Chọn ảnh uỷ nhiệm chi</Text>
      </TouchableOpacity>

      {image && (
        <Image source={{ uri: image.uri }} style={paymentStyles.previewImage} />
      )}

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
