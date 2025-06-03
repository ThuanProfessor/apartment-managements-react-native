import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, Image } from 'react-native';
import { TextInput, Button, Text, Avatar, Surface } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS, CLOUDINARY_CONFIG, CLOUDINARY_URL, encodeFormData } from '../../config/api';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

export const InitialSetupScreen = ({ route }) => {
  const { requirePasswordChange = true, requireAvatar = true } = route.params || {};
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('password'); // 'password' or 'avatar'
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need access to your photos to set an avatar.');
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true
      });

      console.log('Image picker result:', result);

      if (!result.canceled) {
        const asset = result.assets[0];
        console.log('Selected image asset:', asset);

        // Get file extension from URI
        const uriParts = asset.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];

        setAvatar({
          uri: asset.uri,
          type: `image/${fileType}`,
          name: `avatar.${fileType}`,
          base64: asset.base64
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setError('Failed to pick image: ' + error.message);
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        Alert.alert('Error', 'Vui lòng điền đầy đủ thông tin');
        return false;
      }

      if (newPassword !== confirmPassword) {
        Alert.alert('Error', 'Mật khẩu mới không khớp');
        return false;
      }

      if (!user) {
        Alert.alert('Error', 'Chưa đăng nhập. Vui lòng đăng nhập lại.');
        navigation.replace('Login');
        return false;
      }

      setLoading(true);

      const token = await AsyncStorage.getItem('access_token');
      
      // Create form data object
      const formData = {
        old_password: currentPassword,
        new_password: newPassword
      };

      const result = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.CHANGE_PASSWORD}`,
        encodeFormData(formData),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      console.log('Password change response:', result?.data);

      // Wait for backend to update is_first_login flag
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (requireAvatar) {
        setStep('avatar');
        return true;
      }

      navigation.replace('Main'); // Đảm bảo tên route là "Main"
      return true;
    } catch (error) {
      console.error('Change password error:', error.response?.data);
      Alert.alert(
        'Lỗi',
        error.response?.data?.detail || error.response?.data?.error || 'Không thể đổi mật khẩu'
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async () => {
    try {
      if (!avatar) {
        console.log('No avatar selected, skipping upload');
        return true; // Skip avatar upload if no avatar selected
      }

      setLoading(true);
      console.log('Starting avatar upload process...');
      console.log('Avatar data:', avatar);

      // Get token for authorization
      const token = await AsyncStorage.getItem('access_token');

      // Create form data for avatar upload
      const formData = new FormData();
      formData.append('file', {
        uri: avatar.uri,
        type: avatar.type || 'image/jpeg',
        name: 'avatar.jpg'
      });

      // Upload avatar using the dedicated endpoint
      const result = await axios.post(
        `${API_BASE_URL}/upload-avatar/upload/`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Profile update response:', result?.data);

      navigation.replace('Main'); // Đảm bảo tên route là "Main"
      return true;
    } catch (error) {
      console.error('Avatar upload error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        headers: error?.response?.headers,
        config: error?.config
      });
      
      const errorMessage = error?.response?.data?.error || error?.message || 'Unknown error';
      console.error('Avatar upload error:', errorMessage);
      setError('Avatar upload error: ' + errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordStep = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Thay đổi mật khẩu</Text>
      <Text style={styles.description}>
        Vui lòng thay đổi mật khẩu của bạn để tiếp tục sử dụng ứng dụng.
      </Text>
      <TextInput
        label="Mật khẩu hiện tại"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        label="Mật khẩu mới"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        label="Xác nhận mật khẩu mới"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
      />
      {error ? (
        <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
      ) : null}
      <Button
        mode="contained"
        onPress={handlePasswordChange}
        loading={loading}
        disabled={loading}
        style={styles.submitButton}
      >
        Tiếp tục
      </Button>
    </View>
  );

  const renderAvatarStep = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Cập nhật ảnh đại diện</Text>
      <Text style={styles.description}>
        Vui lòng chọn ảnh đại diện của bạn để hoàn tất thiết lập.
      </Text>
      
      <View style={styles.avatarContainer}>
        {avatar ? (
          <Surface style={styles.avatarSurface}>
            <Image
              source={{ uri: avatar.uri }}
              style={styles.avatarImage}
            />
          </Surface>
        ) : (
          <Avatar.Icon size={120} icon="account" />
        )}
        
        <Button
          mode="outlined"
          onPress={pickImage}
          style={styles.uploadButton}
          icon="image-plus"
        >
          Chọn ảnh
        </Button>
      </View>

      <Button
        mode="contained"
        onPress={handleAvatarUpload}
        loading={loading}
        disabled={loading || !avatar}
        style={styles.submitButton}
      >
        Hoàn tất
      </Button>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Thiết lập tài khoản</Text>
      {step === 'password' ? renderPasswordStep() : renderAvatarStep()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#1a73e8',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#202124',
  },
  description: {
    fontSize: 14,
    color: '#5f6368',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatarSurface: {
    borderRadius: 60,
    elevation: 4,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  uploadButton: {
    marginTop: 12,
  },
  submitButton: {
    marginTop: 24,
    paddingVertical: 6,
  },
});

export default InitialSetupScreen;
