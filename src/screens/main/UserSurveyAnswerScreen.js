import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import {
  Title,
  RadioButton,
  Text,
  Button,
  ActivityIndicator,
  TextInput,
} from 'react-native-paper';
import api from '../../config/api';

const UserSurveyAnswerScreen = ({ route, navigation }) => {
  const { survey } = route.params;
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSurveyQuestions();
  }, []);

  const fetchSurveyQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/surveys/${survey.id}/questions/`);
      console.log('📥 Questions:', res.data);
      setQuestions(res.data || []);
    } catch (err) {
      console.error('❌ Lỗi tải câu hỏi:', err.response?.data || err.message);
      Alert.alert('Lỗi', 'Không thể tải câu hỏi khảo sát.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChoice = (questionId, choiceId) => {
    console.log(`👉 Đã chọn: Q${questionId} → C${choiceId}`);
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
  };

  const handleSubmit = async () => {
    if (questions.length === 0) {
      Alert.alert('Không có câu hỏi', 'Phiếu khảo sát này chưa có nội dung.');
      return;
    }

    const unanswered = questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      Alert.alert(
        '⚠️ Thiếu câu trả lời',
        'Vui lòng trả lời tất cả các câu hỏi.'
      );
      return;
    }

    setSubmitting(true);
    try {
      // Gửi kết quả từng câu hỏi
      for (const [questionId, choiceId] of Object.entries(answers)) {
        const payload = {
          survey: survey.id,
          question: parseInt(questionId),
          choice: choiceId,
        };
        console.log(' Gửi survey result:', payload);
        await api.post('/survey-results/', payload);
      }

      // Gửi ý kiến tự do nếu có
      if (feedback.trim()) {
        const fbPayload = {
          survey: survey.id,
          content: feedback.trim(),
        };
        console.log(' Gửi feedback:', fbPayload);
        await api.post('/survey-feedbacks/', fbPayload);
      }

      Alert.alert('✅ Cảm ơn', 'Bạn đã hoàn thành khảo sát.');
      navigation.goBack();
    } catch (err) {
      console.error(' Lỗi gửi:', err.response?.data || err.message);
      Alert.alert('Lỗi', 'Không thể gửi kết quả khảo sát.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>{survey.title}</Title>
      <Text style={styles.description}>{survey.description}</Text>

      {questions.map((q) => (
        <View key={q.id} style={styles.questionBlock}>
          <Text style={styles.questionText}>{q.text || q.content}</Text>
          <RadioButton.Group
            onValueChange={(value) => handleSelectChoice(q.id, value)}
            value={answers[q.id]}
          >
            {q.choices?.map((choice) => (
              <RadioButton.Item
                key={choice.id}
                label={choice.text}
                value={choice.id}
              />
            ))}
          </RadioButton.Group>
        </View>
      ))}

      <View style={styles.feedbackBlock}>
        <Text style={styles.questionText}>Ý kiến khác (nếu có):</Text>
        <TextInput
          placeholder="Nhập ý kiến của bạn..."
          value={feedback}
          onChangeText={setFeedback}
          multiline
          numberOfLines={4}
          mode="outlined"
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.submitButton}
        loading={submitting}
        disabled={submitting}
      >
        Gửi khảo sát
      </Button>
    </ScrollView>
  );
};

export default UserSurveyAnswerScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    color: '#666',
  },
  questionBlock: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  feedbackBlock: {
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 24,
  },
});
