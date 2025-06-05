// ✅ AdminSurveyStatsScreen.js - Thống kê khảo sát
import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Title, Paragraph, Card, ActivityIndicator } from 'react-native-paper';
import api from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminSurveyStatsScreen = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSurveyStats = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      const res = await api.get('/surveys/results/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSurveys(res.data);
    } catch (error) {
      console.error('❌ Lỗi khi lấy kết quả khảo sát:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveyStats();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.header}>Kết quả khảo sát</Title>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 30 }} />
      ) : (
        surveys.map((survey) => (
          <Card key={survey.id} style={styles.card}>
            <Card.Content>
              <Title>{survey.title}</Title>
              {survey.questions.map((q, idx) => (
                <View key={idx} style={styles.questionBlock}>
                  <Paragraph style={styles.question}>{idx + 1}. {q.text}</Paragraph>
                  {q.stats.map((opt, i) => (
                    <Paragraph key={i}>- {opt.option}: {opt.count} lượt</Paragraph>
                  ))}
                </View>
              ))}
            </Card.Content>
          </Card>
        ))
      )}
    </ScrollView>
  );
};

export default AdminSurveyStatsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  card: { marginBottom: 16 },
  questionBlock: { marginTop: 8 },
  question: { fontWeight: 'bold' },
});
