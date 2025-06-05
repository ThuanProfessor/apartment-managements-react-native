import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Portal,
  Modal,
  RadioButton,
  Text,
  ProgressBar,
  List,
} from 'react-native-paper';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, getHeaders } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const SurveysScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [visible, setVisible] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.SURVEYS}`,
        { headers: getHeaders(user?.token) }
      );

      // ✅ Kiểm tra response để đảm bảo là mảng
      const data = response.data;
      if (Array.isArray(data)) {
        setSurveys(data);
      } else if (Array.isArray(data.results)) {
        setSurveys(data.results);
      } else {
        console.warn("Unexpected survey data:", data);
        setSurveys([]); // fallback an toàn
      }
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSurveyOpen = (survey) => {
    navigation.navigate('Survey', { surveyId: survey.id });
  };

  const handleSubmitSurvey = async () => {
    try {
      setLoading(true);
      await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.SURVEY_RESPONSES}`,
        {
          surveyId: selectedSurvey.id,
          responses: responses,
        },
        { headers: getHeaders(user?.token) }
      );
      setVisible(false);
      fetchSurveys();
    } catch (error) {
      console.error('Error submitting survey:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSurveyModal = () => {
    if (!selectedSurvey) return null;

    return (
      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <ScrollView>
            <Title>{selectedSurvey.title}</Title>
            <Paragraph style={styles.description}>
              {selectedSurvey.description}
            </Paragraph>

            {selectedSurvey.questions.map((question, index) => (
              <View key={index} style={styles.questionContainer}>
                <Text style={styles.questionText}>{question.text}</Text>
                <RadioButton.Group
                  onValueChange={value =>
                    setResponses({ ...responses, [question.id]: value })
                  }
                  value={responses[question.id]}
                >
                  {question.options.map((option, optionIndex) => (
                    <RadioButton.Item
                      key={optionIndex}
                      label={option}
                      value={option}
                    />
                  ))}
                </RadioButton.Group>
              </View>
            ))}

            <Button
              mode="contained"
              onPress={handleSubmitSurvey}
              loading={loading}
              style={styles.submitButton}
              disabled={
                Object.keys(responses).length !==
                selectedSurvey.questions.length
              }
            >
              Submit Survey
            </Button>
          </ScrollView>
        </Modal>
      </Portal>
    );
  };

  const renderSurveyResults = (survey) => {
    if (!survey.results) return null;

    return (
      <View style={styles.resultsContainer}>
        <Title style={styles.resultsTitle}>Survey Results</Title>
        {Object.entries(survey.results).map(([question, results], index) => (
          <View key={index} style={styles.resultItem}>
            <Text style={styles.questionText}>{question}</Text>
            {Object.entries(results).map(([option, percentage], optIndex) => (
              <View key={optIndex} style={styles.optionResult}>
                <Text>{option}</Text>
                <ProgressBar
                  progress={percentage / 100}
                  style={styles.progressBar}
                />
                <Text>{`${Math.round(percentage)}%`}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Title>Surveys</Title>
          <Paragraph>Participate in community surveys</Paragraph>
        </Card.Content>
      </Card>

      <View style={styles.surveysList}>
        <Title style={styles.sectionTitle}>Active Surveys</Title>
        {surveys
          .filter(survey => !survey.completed)
          .map((survey, index) => (
            <Card key={index} style={styles.surveyCard}>
              <Card.Content>
                <Title>{survey.title}</Title>
                <Paragraph>{survey.description}</Paragraph>
                <List.Item
                  title="Due Date"
                  description={new Date(survey.dueDate).toLocaleDateString()}
                  left={props => <List.Icon {...props} icon="calendar" />}
                />
                <Button
                  mode="contained"
                  onPress={() => handleSurveyOpen(survey)}
                  style={styles.button}
                >
                  Take Survey
                </Button>
              </Card.Content>
            </Card>
          ))}
      </View>

      <View style={styles.surveysList}>
        <Title style={styles.sectionTitle}>Completed Surveys</Title>
        {surveys
          .filter(survey => survey.completed)
          .map((survey, index) => (
            <Card key={index} style={styles.surveyCard}>
              <Card.Content>
                <Title>{survey.title}</Title>
                <Paragraph>{survey.description}</Paragraph>
                {renderSurveyResults(survey)}
              </Card.Content>
            </Card>
          ))}
      </View>

      {renderSurveyModal()}
    </ScrollView>
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
  surveysList: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  surveyCard: {
    marginBottom: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  description: {
    marginBottom: 16,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 16,
  },
  resultsContainer: {
    marginTop: 16,
  },
  resultsTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  resultItem: {
    marginBottom: 16,
  },
  optionResult: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    marginVertical: 4,
  },
  button: {
    marginTop: 8,
  },
});

export default SurveysScreen;
