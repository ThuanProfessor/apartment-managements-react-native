import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  Title,
  TextInput,
  Button,
  List,
  Portal,
  Modal,
  FAB,
  Chip,
  Paragraph,
} from 'react-native-paper';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';

const ComplaintsScreen = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);  // Initialize as empty array
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      console.log('Fetching complaints from:', `${API_BASE_URL}${API_ENDPOINTS.COMPLAINTS}`);
      
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.COMPLAINTS}`);
      console.log('API Response:', response.data);
      
      // Ensure we have an array, even if the API returns null/undefined
      const complaintsData = response.data?.results || response.data || [];
      console.log('Processed complaints data:', complaintsData);
      
      if (!Array.isArray(complaintsData)) {
        console.error('Complaints data is not an array:', complaintsData);
        setComplaints([]);
        return;
      }
      
      setComplaints(complaintsData);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      console.error('Error details:', error.response?.data || 'No response data');
      setComplaints([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.content || !formData.category) {
        alert('Please fill in all fields');
        return;
      }

      setLoading(true);
      console.log('Submitting complaint with data:', formData);

      // Convert data to FormData
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('content', formData.content);
      formDataObj.append('category', formData.category);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      };

      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.COMPLAINTS}`,
        formDataObj,
        config
      );

      console.log('Submit response:', response.data);
      
      setVisible(false);
      fetchComplaints();
      setFormData({
        title: '',
        content: '',
        category: '',
      });
    } catch (error) {
      console.error('Error submitting complaint:', error);
      console.error('Error details:', error.response?.data || 'No response data');
      alert('Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Maintenance',
    'Security',
    'Noise',
    'Cleanliness',
    'Others',
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
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
        <Title>Submit New Complaint</Title>
        
        <TextInput
          label="Title"
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
          style={styles.input}
        />
        
        <TextInput
          label="Content"
          value={formData.content}
          onChangeText={(text) => setFormData({ ...formData, content: text })}
          multiline
          numberOfLines={4}
          style={styles.input}
        />
        
        <ScrollView horizontal style={styles.categoriesContainer}>
          {categories.map((category) => (
            <Chip
              key={category}
              selected={formData.category === category}
              onPress={() => setFormData({ ...formData, category })}
              style={styles.categoryChip}
            >
              {category}
            </Chip>
          ))}
        </ScrollView>
        
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        >
          Submit Complaint
        </Button>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title>Complaints & Feedback</Title>
          </Card.Content>
        </Card>

        <View style={styles.complaintsList}>
          {Array.isArray(complaints) && complaints.length > 0 ? (
            complaints.map((complaint, index) => (
            <Card key={index} style={styles.complaintCard}>
              <Card.Content>
                <View style={styles.headerRow}>
                  <Title>{complaint.title}</Title>
                  <Chip
                    style={[
                      styles.statusChip,
                      { backgroundColor: getStatusColor(complaint.status) },
                    ]}
                  >
                    {complaint.status}
                  </Chip>
                </View>
                
                <List.Item
                  title="Category"
                  description={complaint.category}
                  left={props => <List.Icon {...props} icon="tag" />}
                />
                
                <List.Item
                  title="Description"
                  description={complaint.description}
                  left={props => <List.Icon {...props} icon="text" />}
                />
                
                {complaint.response && (
                  <List.Item
                    title="Management Response"
                    description={complaint.response}
                    left={props => <List.Icon {...props} icon="reply" />}
                  />
                )}
                
                <List.Item
                  title="Submitted"
                  description={new Date(complaint.createdAt).toLocaleDateString()}
                  left={props => <List.Icon {...props} icon="calendar" />}
                />
              </Card.Content>
            </Card>
          ))) : (
            <Card style={styles.complaintCard}>
              <Card.Content>
                <Title>No complaints yet</Title>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setVisible(true)}
        label="New Complaint"
      />

      {renderComplaintModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  summaryCard: {
    margin: 16,
    elevation: 4,
  },
  complaintsList: {
    padding: 16,
  },
  complaintCard: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  statusChip: {
    color: 'white',
  },
  submitButton: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default ComplaintsScreen;
