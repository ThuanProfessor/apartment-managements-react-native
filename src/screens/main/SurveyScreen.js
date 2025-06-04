import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Title, Button, RadioButton, TextInput, ActivityIndicator } from 'react-native-paper';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, getHeaders } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const SurveyScreen = ({ route, navigation }) => {
  const { user } = useAuth();
  const surveyId = route.params?.surveyId;

  if (!surveyId) {
    return (
      <View style={styles.container}>
        <Text>Vui lòng chọn một khảo sát để xem chi tiết</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('Surveys')}
          style={{ marginTop: 16 }}
        >
          Xem danh sách khảo sát
        </Button>
      </View>
    );
  }
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSurvey();
  }, [surveyId]);

  const fetchSurvey = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.SURVEYS}${surveyId}/`, {
        headers: getHeaders(user?.token)
      });
      setSurvey(response.data);
      
      // Initialize answers
      const initialAnswers = {};
      response.data.questions.forEach(question => {
        initialAnswers[question.id] = '';
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error fetching survey:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}${API_ENDPOINTS.SURVEYS}${surveyId}/submit/`, {
        headers: getHeaders(user?.token),
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          question_id: questionId,
          answer
        }))
      });
      
      navigation.goBack();
    } catch (error) {
      console.error('Error submitting survey:', error);
    } finally {
      setSubmitting(false); 
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!survey) {
    return (
      <View style={styles.container}>
        <Text>Không tìm thấy khảo sát</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.surveyCard}>
        <Card.Content>
          <Title style={styles.title}>{survey.title}</Title>
          {survey.description && (
            <Text style={styles.description}>{survey.description}</Text>
          )}

          {survey.questions.map((question) => (
            <View key={question.id} style={styles.questionContainer}>
              <Text style={styles.questionText}>{question.text}</Text>

              {question.type === 'multiple_choice' ? (
                <RadioButton.Group
                  onValueChange={value => 
                    setAnswers(prev => ({ ...prev, [question.id]: value }))
                  }
                  value={answers[question.id]}
                >
                  {question.choices.map((choice) => (
                    <View key={choice.id} style={styles.choiceContainer}>
                      <RadioButton.Item
                        label={choice.text}
                        value={choice.id.toString()}
                      />
                    </View>
                  ))}
                </RadioButton.Group>
              ) : (
                <TextInput
                  mode="outlined"
                  value={answers[question.id]}
                  onChangeText={text => 
                    setAnswers(prev => ({ ...prev, [question.id]: text }))
                  }
                  multiline={question.type === 'text'}
                  style={styles.textInput}
                />
              )}
            </View>
          ))}

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
            style={styles.submitButton}
          >
            Gửi câu trả lời
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  surveyCard: {
    margin: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    color: '#1976D2',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  choiceContainer: {
    marginVertical: 4,
  },
  textInput: {
    backgroundColor: '#fff',
  },
  submitButton: {
    marginTop: 16,
  },
});

export default SurveyScreen;
