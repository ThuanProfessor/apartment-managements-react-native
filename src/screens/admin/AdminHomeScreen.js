import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert,
  Button,
} from 'react-native';
import { Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import api from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const numColumns = 2;
const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - 48) / numColumns;

const AdminHomeScreen = ({ navigation }) => {
  const [apartments, setApartments] = useState([]);
  const [filteredApartments, setFilteredApartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const fetchApartments = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      const res = await api.get('/apartments/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApartments(res.data);
      setFilteredApartments(res.data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách căn hộ:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApartments();
  }, []);

  const handleSearch = (text) => {
    setSearchText(text);
    if (!text) {
      setFilteredApartments(apartments);
    } else {
      const filtered = apartments.filter((item) =>
        item.apartment_number.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredApartments(filtered);
    }
  };

  

  const renderApartment = ({ item }) => (
    <TouchableOpacity
      style={styles.cardWrapper}
      onPress={() => navigation.navigate('ApartmentDetail', { apartmentId: item.id })}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="home-city" size={28} color="#4a90e2" />
          </View>
          <Title style={styles.apartmentTitle}>{item.apartment_number}</Title>
          <Paragraph style={styles.floor}>Tầng: {item.floor}</Paragraph>
          <Paragraph style={styles.residents}>👤 Cư dân: {item.residents?.length || 0}</Paragraph>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Title style={styles.header}>Quản lý căn hộ</Title>

     

      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm số căn hộ..."
        value={searchText}
        onChangeText={handleSearch}
      />

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredApartments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderApartment}
          numColumns={numColumns}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

export default AdminHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
    textAlign: 'center',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 12,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  loader: {
    marginTop: 32,
  },
  listContent: {
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardWrapper: {
    width: cardWidth,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 4,
    paddingHorizontal: 10,
    paddingVertical: 14,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  apartmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495e',
    textAlign: 'center',
  },
  floor: {
    marginTop: 4,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  residents: {
    marginTop: 2,
    color: '#95a5a6',
    textAlign: 'center',
  },
});
