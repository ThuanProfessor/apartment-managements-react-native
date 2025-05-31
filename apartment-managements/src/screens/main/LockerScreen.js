import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import {
  Card,
  Title, 
  Paragraph,
  Badge,
  List,
  Divider,
  useTheme,
  Button,
  ActivityIndicator,
  Portal,
  Dialog,
  IconButton,
  Searchbar,
} from 'react-native-paper';
import axios from 'axios';
import messaging from '@react-native-firebase/messaging';
import { API_BASE_URL, API_ENDPOINTS, getHeaders } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const LockerScreen = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [packages, setPackages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPackages, setFilteredPackages] = useState([]);

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    // Setup Firebase notification listener
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      if (remoteMessage.data.type === 'new_package') {
        Alert.alert(
          'New Package',
          'You have a new package in your locker',
          [{ text: 'View', onPress: () => fetchPackages() }]
        );
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    filterPackages();
  }, [searchQuery, packages]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.LOCKER_ITEMS}`,
        { headers: getHeaders(user?.token) }
      );
      setPackages(response.data);
    } catch (error) {
      console.error('Error fetching packages:', error);
      setError('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchPackages().then(() => setRefreshing(false));
  }, []);

  const filterPackages = () => {
    const filtered = packages.filter(pkg => 
      pkg.item_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.tracking_code?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPackages(filtered);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return theme.colors.warning;
      case 'received':
        return theme.colors.success;
      case 'awaiting pickup':
        return theme.colors.primary;
      default:
        return theme.colors.disabled;
    }
  };

  const handleMarkAsReceived = async (item) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}${API_ENDPOINTS.LOCKER_ITEMS}${item.id}/mark_received/`,
        {},
        { headers: getHeaders(user?.token) }
      );
      
      if (response.status === 200) {
        // Update local state
        const updatedPackages = packages.map(pkg => 
          pkg.id === item.id ? {...pkg, status: 'received'} : pkg
        );
        setPackages(updatedPackages);
        Alert.alert('Success', 'Item marked as received');
      }
    } catch (error) {
      console.error('Error marking item as received:', error);
      Alert.alert('Error', 'Failed to mark item as received');
    }
    setShowConfirmDialog(false);
    setSelectedItem(null);
  };

  const renderPackageItem = (pkg) => (
    <Card style={styles.packageCard} key={pkg.id}>
      <Card.Content>
        <View style={styles.headerRow}>
          <Title>{pkg.trackingNumber || 'No Tracking Number'}</Title>
          <Badge
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(pkg.status) },
            ]}
          >
            {pkg.status}
          </Badge>
        </View>
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Delivery Date"
          description={pkg.deliveryDate ? new Date(pkg.deliveryDate).toLocaleDateString() : 'N/A'}
          left={props => <List.Icon {...props} icon="calendar" />}
        />
        
        <List.Item
          title="Description"
          description={pkg.item_description || 'No description'}
          left={props => <List.Icon {...props} icon="package-variant" />}
        />
        
        {pkg.tracking_code && (
          <List.Item
            title="Tracking Code"
            description={pkg.tracking_code}
            left={props => <List.Icon {...props} icon="barcode" />}
          />
        )}
        
        {pkg.status === 'pending' && (
          <Button
            mode="contained"
            onPress={() => {
              setSelectedItem(pkg);
              setShowConfirmDialog(true);
            }}
            style={styles.receiveButton}
          >
            Mark as Received
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title>Digital Locker</Title>
            <Paragraph>Track your package deliveries and pickups</Paragraph>
            <Searchbar
              placeholder="Search packages..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />
          </Card.Content>
        </Card>

        {error && (
          <Card style={[styles.messageCard, styles.errorCard]}>
            <Card.Content>
              <Paragraph style={styles.errorText}>{error}</Paragraph>
            </Card.Content>
          </Card>
        )}

        {loading ? (
          <ActivityIndicator style={styles.loader} />
        ) : (
          <>
            <View style={styles.packagesList}>
              <Title style={styles.sectionTitle}>Pending Packages</Title>
              {filteredPackages.filter(pkg => pkg.status === 'pending').length === 0 ? (
                <Paragraph style={styles.emptyMessage}>
                  {searchQuery ? 'No matching pending packages' : 'No pending packages'}
                </Paragraph>
              ) : (
                filteredPackages
                  .filter(pkg => pkg.status === 'pending')
                  .map(renderPackageItem)
              )}
            </View>

            <View style={styles.packagesList}>
              <Title style={styles.sectionTitle}>Package History</Title>
              {filteredPackages.filter(pkg => pkg.status === 'received').length === 0 ? (
                <Paragraph style={styles.emptyMessage}>
                  {searchQuery ? 'No matching packages in history' : 'No package history'}
                </Paragraph>
              ) : (
                filteredPackages
                  .filter(pkg => pkg.status === 'received')
                  .map(renderPackageItem)
              )}
            </View>
          </>
        )}
      </ScrollView>

      <Portal>
        <Dialog
          visible={showConfirmDialog}
          onDismiss={() => setShowConfirmDialog(false)}
        >
          <Dialog.Title>Confirm Reception</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Are you sure you want to mark this item as received?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button 
              onPress={() => handleMarkAsReceived(selectedItem)}
              mode="contained"
            >
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  packagesList: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  packageCard: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
  },
  divider: {
    marginVertical: 12,
  },
  loader: {
    marginTop: 20,
  },
  messageCard: {
    margin: 16,
  },
  errorCard: {
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#c62828',
  },
  emptyMessage: {
    textAlign: 'center',
    marginVertical: 20,
    fontStyle: 'italic',
  },
  receiveButton: {
    marginTop: 16,
  },
  searchBar: {
    marginTop: 16,
    elevation: 0,
  },
});

export default LockerScreen;
