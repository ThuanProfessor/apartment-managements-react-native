import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  FAB,
  Portal,
  Modal,
  TextInput,
  Button,
  Text,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import api from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ApartmentManagementScreen = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    apartment_number: '',
    floor: '',
  });
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  const fetchApartments = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      const res = await api.get('/apartments/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApartments(res.data);
    } catch (error) {
      console.error('Lỗi tải danh sách căn hộ:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApartments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchApartments().finally(() => setRefreshing(false));
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      await api.post('/apartments/', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModalVisible(false);
      setFormData({ apartment_number: '', floor: '' });
      fetchApartments();
    } catch (error) {
      console.error('Lỗi thêm căn hộ:', error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Căn hộ {item.apartment_number}</Title>
          <Paragraph style={styles.cardSubtitle}>Tầng: {item.floor}</Paragraph>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Title style={styles.header}>Danh sách căn hộ</Title>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={apartments}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContent}>
          <Title style={{ marginBottom: 12 }}>Thêm căn hộ</Title>
          <TextInput
            label="Số căn hộ"
            value={formData.apartment_number}
            onChangeText={(text) => setFormData({ ...formData, apartment_number: text })}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Tầng"
            value={formData.floor}
            onChangeText={(text) => setFormData({ ...formData, floor: text })}
            mode="outlined"
            style={styles.input}
          />
          <Button mode="contained" onPress={handleSubmit} style={{ marginTop: 12 }}>
            Lưu
          </Button>
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setModalVisible(true)}
      />
    </View>
  );
};

export default ApartmentManagementScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9F9F9',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 3,
    paddingVertical: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cardSubtitle: {
    marginTop: 4,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  input: {
    marginBottom: 12,
  },
});
