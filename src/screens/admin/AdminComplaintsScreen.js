import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Card, Title, Chip, Button } from 'react-native-paper';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const AdminComplaintsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/feedbacks/`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setComplaints(res.data?.results || res.data || []);
    } catch (error) {
      console.error('❌ Lỗi lấy phản ánh:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
  try {
    const form = new FormData(); // Gửi rỗng cũng được nếu không cần dữ liệu thêm
    const res = await axios.patch(`${API_BASE_URL}/feedbacks/${id}/resolve/`, form, {
      headers: {
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    fetchComplaints();
  } catch (error) {
    console.error('❌ Lỗi khi xác nhận:', error.response?.data || error.message);
  }
};

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#FFA000';
      case 'resolved': return '#43A047';
      default: return '#757575';
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Quản lý phản ánh</Title>

      {complaints.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => navigation.navigate('FeedbackDetailScreen', { feedback: item })}
        >
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.row}>
                <Title>{item.title || `Phản ánh #${item.id}`}</Title>
                <Chip
                  style={[styles.status, { backgroundColor: getStatusColor(item.status) }]}
                  textStyle={{ color: 'white' }}
                >
                  {item.status}
                </Chip>
              </View>

              <Text style={styles.label}>📌 Danh mục:</Text>
              <Text>{item.category}</Text>

              <Text style={styles.label}>📝 Nội dung:</Text>
              <Text numberOfLines={2}>{item.content.replace(/<[^>]+>/g, '')}</Text>

              {item.status !== 'resolved' && (
                <Button
                  mode="contained"
                  style={styles.button}
                  onPress={() => handleResolve(item.id)}
                >
                  Đánh dấu đã xử lý
                </Button>
              )}
            </Card.Content>
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default AdminComplaintsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  card: { marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  status: { borderRadius: 16, paddingHorizontal: 8 },
  label: { fontWeight: 'bold', marginTop: 8 },
  button: { marginTop: 12 },
});
