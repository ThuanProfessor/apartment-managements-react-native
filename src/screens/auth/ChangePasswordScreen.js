import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface, Title } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

const ChangePasswordScreen = ({ navigation, route }) => {
  const isFirstLogin = route.params?.isFirstLogin;
  const { changePassword } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const result = await changePassword(oldPassword, newPassword);
      if (result.success) {
        if (isFirstLogin) {
          navigation.replace('Home');
        } else {
          navigation.goBack();
        }
      } else {
        setError(result.error || 'Failed to change password');
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.formContainer} elevation={2}>
        <Title style={styles.title}>
          {isFirstLogin ? 'Đổi mật khẩu lần đầu' : 'Đổi mật khẩu'}
        </Title>
        
        {isFirstLogin && (
          <Text style={styles.description}>
            Vui lòng đổi mật khẩu để tiếp tục sử dụng hệ thống
          </Text>
        )}

        <TextInput
          label="Mật khẩu hiện tại"
          value={oldPassword}
          onChangeText={setOldPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
          left={<TextInput.Icon icon="lock" />}
        />

        <TextInput
          label="Mật khẩu mới"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
          left={<TextInput.Icon icon="lock-plus" />}
        />

        <TextInput
          label="Xác nhận mật khẩu mới"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
          left={<TextInput.Icon icon="lock-check" />}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          mode="contained"
          onPress={handleChangePassword}
          loading={loading}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Xác nhận đổi mật khẩu
        </Button>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 24,
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
});

export default ChangePasswordScreen;
