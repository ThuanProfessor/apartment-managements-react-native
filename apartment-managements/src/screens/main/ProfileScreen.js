import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Avatar, Title, Text, Button, Divider, Surface, TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateProfile } = useAuth();
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setAvatar(result.uri);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };

  const handlePasswordChange = async () => {
    if (!password) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu mới.');
      return;
    }

    try {
      setLoading(true);
      await updateProfile({ password });
      Alert.alert('Thành công', 'Mật khẩu đã được thay đổi.');
      setPassword('');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đổi mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Surface style={styles.profileCard} elevation={4}>
        <Avatar.Image 
          size={100} 
          source={avatar ? { uri: avatar } : { uri: 'https://via.placeholder.com/100' }} 
          style={styles.avatar} 
        />
        <Button mode="outlined" onPress={handleImagePicker} style={styles.uploadButton}>
          Đổi ảnh đại diện
        </Button>
        <Title style={styles.name}>{user?.fullName || 'Cư dân'}</Title>
        <Text style={styles.username}>@{user?.username}</Text>
        <Divider style={styles.divider} />
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{user?.email || 'Không có email'}</Text>
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Số điện thoại:</Text>
          <Text style={styles.infoValue}>{user?.phone || 'Không có số điện thoại'}</Text>
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Căn hộ:</Text>
          <Text style={styles.infoValue}>{user?.apartment || 'Chưa gán căn hộ'}</Text>
        </View>
        <Divider style={styles.divider} />
        <TextInput
          label="Mật khẩu mới"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
        />
        <Button 
          mode="contained" 
          onPress={handlePasswordChange} 
          loading={loading} 
          style={styles.changePasswordButton}
        >
          Đổi mật khẩu
        </Button>
        <Button 
          mode="contained" 
          onPress={logout} 
          style={styles.logoutButton}
        >
          Đăng xuất
        </Button>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  profileCard: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  avatar: {
    marginBottom: 16,
  },
  uploadButton: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  divider: {
    width: '100%',
    marginVertical: 16,
  },
  infoSection: {
    width: '100%',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    width: '100%',
    marginBottom: 16,
  },
  changePasswordButton: {
    marginTop: 8,
    width: '100%',
  },
  logoutButton: {
    marginTop: 16,
    width: '100%',
  },
});

export default ProfileScreen;
