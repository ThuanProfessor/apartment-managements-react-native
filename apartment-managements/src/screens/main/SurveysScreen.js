import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Text, useTheme } from 'react-native-paper';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HTML from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';

const SurveysScreen = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();
  const { width } = useWindowDimensions();

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('access_token');
      console.log('Fetching surveys with token:', token);

      const response = await axios.get(
        `${API_BASE_URL}/api/apartment/surveys/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Surveys response:', response.data);
      setSurveys(response.data.results || []);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      setError('Không thể tải danh sách khảo sát');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderSurveyItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.title}>{item.title}</Title>
        <HTML
          source={{ html: item.description }}
          contentWidth={width - 64}
          baseStyle={styles.description}
        />
        <View style={styles.dateContainer}>
          <Text style={styles.date}>
            Bắt đầu: {new Date(item.start_date).toLocaleDateString()}
          </Text>
          <Text style={styles.date}>
            Kết thúc: {new Date(item.end_date).toLocaleDateString()}
          </Text>
        </View>
        <Text
          style={[
            styles.status,
            {
              color: item.is_active
                ? theme.colors.primary
                : theme.colors.error,
            },
          ]}
        >
          {item.is_active ? 'Đang diễn ra' : 'Đã kết thúc'}
        </Text>
      </Card.Content>
    </Card>
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSurveys();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text>Đang tải khảo sát...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!surveys || surveys.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Không có khảo sát nào</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={surveys}
        renderItem={renderSurveyItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  date: {
    fontSize: 12,
    color: '#777',
  },
  status: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
});

export default SurveysScreen;
