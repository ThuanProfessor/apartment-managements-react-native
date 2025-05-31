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
} from 'react-native-paper';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, getHeaders } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const ComplaintsScreen = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.COMPLAINTS}`,
        { headers: getHeaders(user?.token) }
      );
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.COMPLAINTS}`,
        formData,
        { headers: getHeaders(user?.token) }
      );
      setVisible(false);
      fetchComplaints();
      setFormData({
        title: '',
        description: '',
        category: '',
      });
    } catch (error) {
      console.error('Error submitting complaint:', error);
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
          label="Description"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
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
          {complaints.map((complaint, index) => (
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
          ))}
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
