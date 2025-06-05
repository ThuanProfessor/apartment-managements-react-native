import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
} from 'react-native';
import {
  Card,
  Title,
  TextInput,
  Button,
  Portal,
  Modal,
  FAB,
  Chip,
} from 'react-native-paper';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const ComplaintsScreen = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
  });

  const categories = ['Maintenance', 'Security', 'Noise', 'Cleanliness', 'Others'];

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.COMPLAINTS}`);
      const data = res.data?.results || res.data || [];
      setComplaints(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Lỗi khi lấy khiếu nại:', error.response?.data || error.message);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content || !formData.category) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);

      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('content', formData.content);
      formDataObj.append('category', formData.category);

      await axios.post(`${API_BASE_URL}${API_ENDPOINTS.COMPLAINTS}`, formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setVisible(false);
      setFormData({ title: '', content: '', category: '' });
      fetchComplaints();
    } catch (error) {
      console.error('❌ Lỗi khi gửi khiếu nại:', error.response?.data || error.message);
      alert('Không thể gửi khiếu nại, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#FFA000';
      case 'in progress':
        return '#1976D2';
      case 'resolved':
        return '#43A047';
      default:
        return '#757575';
    }
  };

  const renderComplaintModal = () => (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={() => setVisible(false)}
        contentContainerStyle={styles.modalContent}
      >
        <Title style={styles.modalTitle}>Gửi phản ánh mới</Title>

        <TextInput
          label="Tiêu đề"
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
          style={styles.input}
        />

        <TextInput
          label="Nội dung"
          value={formData.content}
          onChangeText={(text) => setFormData({ ...formData, content: text })}
          multiline
          numberOfLines={4}
          style={styles.input}
        />

        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <Chip
              key={category}
              selected={formData.category === category}
              onPress={() => setFormData({ ...formData, category })}
              style={[
                styles.categoryChip,
                formData.category === category && styles.selectedCategoryChip,
              ]}
              textStyle={{
                color: formData.category === category ? 'white' : '#333',
              }}
            >
              {category}
            </Chip>
          ))}
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        >
          Gửi phản ánh
        </Button>
      </Modal>
    </Portal>
  );

  const renderComplaintCard = (complaint, index) => (
    <Card key={index} style={styles.complaintCard}>
      <Card.Content>
        <View style={styles.headerRow}>
          <Title style={styles.complaintTitle}>{complaint.title}</Title>
          <Chip
            style={[
              styles.statusChip,
              { backgroundColor: getStatusColor(complaint.status) },
            ]}
            textStyle={{ color: 'white' }}
          >
            {complaint.status}
          </Chip>
        </View>

        <Text style={styles.label}>📌 Danh mục:</Text>
        <Text style={styles.text}>{complaint.category}</Text>

        <Text style={styles.label}>📝 Nội dung:</Text>
        <Text style={styles.text}>
          {stripHtml(complaint.description || complaint.content)}
        </Text>

        {complaint.response && (
          <>
            <Text style={styles.label}>💬 Phản hồi từ ban quản lý:</Text>
            <Text style={styles.text}>
              {stripHtml(complaint.response)}
            </Text>
          </>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Title style={styles.pageTitle}>Phản ánh & Góp ý</Title>

        {complaints.length > 0 ? (
          complaints.map(renderComplaintCard)
        ) : (
          <Card style={styles.complaintCard}>
            <Card.Content>
              <Title>Chưa có phản ánh nào</Title>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setVisible(true)}
        label="Tạo mới"
      />

      {renderComplaintModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  complaintCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    padding: 4,
  },
  complaintTitle: {
    fontSize: 18,
    flex: 1,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    color: '#444',
    marginTop: 8,
  },
  text: {
    color: '#555',
    marginBottom: 4,
  },
  statusChip: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 16,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#e0e0e0',
  },
  selectedCategoryChip: {
    backgroundColor: '#1976D2',
  },
  submitButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});

export default ComplaintsScreen;
