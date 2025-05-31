import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Portal,
  Modal,
  TextInput,
  List,
  FAB,
} from 'react-native-paper';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, getHeaders } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const ParkingScreen = () => {
  const { user } = useAuth();
  const [parkingCards, setParkingCards] = useState([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicleType: '',
    licensePlate: '',
    ownerName: '',
    relationship: '',
  });

  useEffect(() => {
    fetchParkingCards();
  }, []);

  const fetchParkingCards = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.PARKING_CARDS}`,
        { headers: getHeaders(user?.token) }
      );
      setParkingCards(response.data);
    } catch (error) {
      console.error('Error fetching parking cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.PARKING_REGISTRATION}`,
        formData,
        { headers: getHeaders(user?.token) }
      );
      setVisible(false);
      fetchParkingCards();
      setFormData({
        vehicleType: '',
        licensePlate: '',
        ownerName: '',
        relationship: '',
      });
    } catch (error) {
      console.error('Error registering parking:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderRegistrationModal = () => (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={() => setVisible(false)}
        contentContainerStyle={styles.modalContent}
      >
        <Title>Register New Vehicle</Title>
        
        <TextInput
          label="Vehicle Type"
          value={formData.vehicleType}
          onChangeText={(text) => setFormData({ ...formData, vehicleType: text })}
          style={styles.input}
        />
        
        <TextInput
          label="License Plate"
          value={formData.licensePlate}
          onChangeText={(text) => setFormData({ ...formData, licensePlate: text })}
          style={styles.input}
        />
        
        <TextInput
          label="Owner Name"
          value={formData.ownerName}
          onChangeText={(text) => setFormData({ ...formData, ownerName: text })}
          style={styles.input}
        />
        
        <TextInput
          label="Relationship"
          value={formData.relationship}
          onChangeText={(text) => setFormData({ ...formData, relationship: text })}
          style={styles.input}
        />
        
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          style={styles.button}
        >
          Submit Registration
        </Button>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title>Parking Cards</Title>
            <Paragraph>Manage your vehicle registrations</Paragraph>
          </Card.Content>
        </Card>

        <View style={styles.cardsList}>
          {parkingCards.map((card, index) => (
            <Card key={index} style={styles.parkingCard}>
              <Card.Content>
                <Title>{card.vehicleType}</Title>
                <Paragraph>License Plate: {card.licensePlate}</Paragraph>
                <Paragraph>Owner: {card.ownerName}</Paragraph>
                <Paragraph>Relationship: {card.relationship}</Paragraph>
                <Paragraph>Status: {card.status}</Paragraph>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setVisible(true)}
        label="Register New Vehicle"
      />

      {renderRegistrationModal()}
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
  cardsList: {
    padding: 16,
  },
  parkingCard: {
    marginBottom: 16,
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
  button: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default ParkingScreen;
