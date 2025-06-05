import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Title, IconButton, Divider } from 'react-native-paper';
import api from '../../config/api';

const AdminSurveyCreateScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState(['']);
  const [loading, setLoading] = useState(false);

  const handleAddQuestion = () => {
    setQuestions([...questions, '']);
  };

  const handleRemoveQuestion = (index) => {
    const newList = [...questions];
    newList.splice(index, 1);
    setQuestions(newList);
  };

  const handleQuestionChange = (text, index) => {
    const newList = [...questions];
    newList[index] = text;
    setQuestions(newList);
  };

  const handleSubmit = async () => {
    if (!title || !description || questions.some((q) => !q)) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);

      // 1. Tạo khảo sát
      const surveyRes = await api.post('/surveys/', { title, description });

      const surveyId = surveyRes.data?.id;
      if (!surveyId) {
        throw new Error('Không lấy được ID khảo sát từ phản hồi.');
      }

      console.log('✅ Tạo khảo sát với ID:', surveyId);

      // 2. Gửi từng câu hỏi kèm theo survey ID
      await Promise.all(
        questions.map((q) =>
          api.post('/survey-questions/', {
            survey: surveyId,
            text: q,
          })
        )
      );

      Alert.alert('Thành công', '✅ Tạo khảo sát thành công!');
      navigation.goBack();
    } catch (err) {
      console.error('❌ Error:', err.response?.data || err.message);
      Alert.alert('Lỗi', 'Không thể tạo khảo sát. Hãy kiểm tra lại dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title>Tạo khảo sát mới</Title>

      <TextInput
        label="Tiêu đề khảo sát"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        mode="outlined"
      />

      <TextInput
        label="Mô tả khảo sát"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        mode="outlined"
        multiline
      />

      <Divider style={{ marginVertical: 8 }} />

      {questions.map((q, index) => (
        <View key={index} style={styles.questionRow}>
          <TextInput
            label={`Câu hỏi ${index + 1}`}
            value={q}
            onChangeText={(text) => handleQuestionChange(text, index)}
            mode="outlined"
            style={[styles.input, { flex: 1 }]}
          />
          <IconButton
            icon="delete"
            onPress={() => handleRemoveQuestion(index)}
            disabled={questions.length === 1}
          />
        </View>
      ))}

      <Button onPress={handleAddQuestion} icon="plus" style={styles.addBtn}>
        Thêm câu hỏi
      </Button>

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
      >
        Tạo khảo sát
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  input: { marginBottom: 12 },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addBtn: { marginVertical: 12 },
});

export default AdminSurveyCreateScreen;
