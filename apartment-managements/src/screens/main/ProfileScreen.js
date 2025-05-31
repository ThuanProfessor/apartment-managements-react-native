import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import {
  Avatar,
  Title,
  Card,
  Button,
  List,
  Portal,
  Modal,
  TextInput,
  Divider,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, getHeaders } from '../../config/api';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to update your avatar!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      handleAvatarUpdate(result.assets[0]);
    }
  };

  const handleAvatarUpdate = async (imageAsset) => {
    try {
      setLoading(true);
      
      // Create form data for image upload
      const formData = new FormData();
      formData.append('avatar', {
        uri: imageAsset.uri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      });

      await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.UPDATE_AVATAR}`,
        formData,
        {
          headers: {
            ...getHeaders(user?.token),
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Refresh user profile to get updated avatar
      await updateProfile();
    } catch (error) {
      console.error('Error updating avatar:', error);
      alert('Failed to update avatar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      await updateProfile(formData);
      setEditVisible(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderEditModal = () => (
    <Portal>
      <Modal
        visible={editVisible}
        onDismiss={() => setEditVisible(false)}
        contentContainerStyle={styles.modalContent}
      >
        <Title>Edit Profile</Title>
        
        <TextInput
          label="Full Name"
          value={formData.fullName}
          onChangeText={(text) => setFormData({ ...formData, fullName: text })}
          style={styles.input}
        />
        
        <TextInput
          label="Email"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        
        <TextInput
          label="Phone"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          keyboardType="phone-pad"
          style={styles.input}
        />
        
        <Button
          mode="contained"
          onPress={handleProfileUpdate}
          loading={loading}
          style={styles.button}
        >
          Save Changes
        </Button>
      </Modal>
    </Portal>
  );

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Icon
            size={100}
            icon="account"
            color="#fff"
            style={{ backgroundColor: '#1a73e8' }}
          />
          <Button
            mode="outlined"
            onPress={pickImage}
            loading={loading}
            style={styles.avatarButton}
          >
            Change Avatar
          </Button>
          <Title style={styles.name}>{user?.fullName || user?.username}</Title>
        </Card.Content>
      </Card>

      <Card style={styles.detailsCard}>
        <Card.Content>
          <List.Item
            title="Username"
            description={user?.username}
            left={props => <List.Icon {...props} icon="account" />}
          />
          <Divider />
          <List.Item
            title="Email"
            description={user?.email || 'Not set'}
            left={props => <List.Icon {...props} icon="email" />}
          />
          <Divider />
          <List.Item
            title="Phone"
            description={user?.phone || 'Not set'}
            left={props => <List.Icon {...props} icon="phone" />}
          />
        </Card.Content>
      </Card>

      <Card style={styles.actionsCard}>
        <Card.Content>
          <Button
            mode="contained"
            onPress={() => setEditVisible(true)}
            style={styles.button}
          >
            Edit Profile
          </Button>
          
          <Button
            mode="contained"
            onPress={() => navigation.navigate('ChangePassword')}
            style={styles.button}
          >
            Change Password
          </Button>
          
          <Button
            mode="outlined"
            onPress={logout}
            style={styles.button}
          >
            Logout
          </Button>
        </Card.Content>
      </Card>

      {renderEditModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileCard: {
    margin: 16,
    elevation: 4,
  },
  profileContent: {
    alignItems: 'center',
    padding: 16,
  },
  avatarButton: {
    marginTop: 8,
  },
  name: {
    marginTop: 8,
    fontSize: 24,
  },
  detailsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
  },
  actionsCard: {
    margin: 16,
    elevation: 4,
  },
  button: {
    marginVertical: 8,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  input: {
    marginBottom: 12,
  },
});

export default ProfileScreen;
