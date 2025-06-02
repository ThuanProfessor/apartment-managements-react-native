import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Surface, Text, Title, FAB, Portal, Modal, TextInput, Button, IconButton, useTheme, ActivityIndicator, Menu, Divider, Chip, ProgressBar } from 'react-native-paper';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';

const SurveyManagementScreen = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const theme = useTheme();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    questions: [
      {
        text: '',
        type: 'multiple_choice',
        options: ['', ''],
      }
    ],
  });

  const fetchSurveys = async (pageNumber = 1, shouldRefresh = false) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/surveys/?page=${pageNumber}`);
      const { results, next } = response.data;
      
      if (shouldRefresh) {
        setSurveys(results);
      } else {
        setSurveys(prev => [...prev, ...results]);
      }
      
      setHasMore(!!next);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSurveys(1, true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchSurveys(page + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/surveys/`, formData);
      setModalVisible(false);
      setFormData({
        title: '',
        description: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        questions: [
          {
            text: '',
            type: 'multiple_choice',
            options: ['', ''],
          }
        ],
      });
      onRefresh();
    } catch (error) {
      console.error('Error creating survey:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          text: '',
          type: 'multiple_choice',
          options: ['', ''],
        }
      ],
    });
  };

  const handleAddOption = (questionIndex) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options.push('');
    setFormData({
      ...formData,
      questions: newQuestions,
    });
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    const newQuestions = [...formData.questions];
    if (field === 'text') {
      newQuestions[questionIndex].text = value;
    } else if (field === 'type') {
      newQuestions[questionIndex].type = value;
    }
    setFormData({
      ...formData,
      questions: newQuestions,
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setFormData({
      ...formData,
      questions: newQuestions,
    });
  };

  const renderItem = ({ item }) => (
    <Surface style={styles.surveyCard} elevation={2}>
      <View style={styles.surveyHeader}>
        <View>
          <Title style={styles.surveyTitle}>{item.title}</Title>
          <Text style={styles.surveyDates}>
            {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
          </Text>
        </View>
        <Menu
          visible={menuVisible && selectedSurvey?.id === item.id}
          onDismiss={() => {
            setMenuVisible(false);
            setSelectedSurvey(null);
          }}
          anchor={
            <IconButton
              icon="dots-vertical"
              onPress={() => {
                setSelectedSurvey(item);
                setMenuVisible(true);
              }}
            />
          }
        >
          <Menu.Item 
            onPress={() => {
              // TODO: View results
              setMenuVisible(false);
            }} 
            title="Xem kết quả"
            leadingIcon="chart-bar"
          />
          <Menu.Item 
            onPress={() => {
              // TODO: Edit survey
              setMenuVisible(false);
            }} 
            title="Chỉnh sửa"
            leadingIcon="pencil"
          />
          <Divider />
          <Menu.Item 
            onPress={() => {
              // TODO: Delete survey
              setMenuVisible(false);
            }} 
            title="Xóa"
            leadingIcon="delete"
          />
        </Menu>
      </View>
      
      <View style={styles.surveyBody}>
        <Text style={styles.surveyDescription}>{item.description}</Text>
        
        <View style={styles.surveyStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Số câu hỏi:</Text>
            <Text style={styles.statValue}>{item.questions.length}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Đã trả lời:</Text>
            <Text style={styles.statValue}>{item.responses_count}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>Tỷ lệ hoàn thành</Text>
          <ProgressBar
            progress={item.completion_rate}
            color={theme.colors.primary}
            style={styles.progressBar}
          />
          <Text style={styles.progressValue}>{Math.round(item.completion_rate * 100)}%</Text>
        </View>

        <View style={styles.tags}>
          <Chip 
            mode="outlined" 
            style={styles.statusChip}
            textStyle={{ color: item.is_active ? '#4CAF50' : '#757575' }}
          >
            {item.is_active ? 'Đang diễn ra' : 'Đã kết thúc'}
          </Chip>
          {item.category && (
            <Chip mode="outlined" style={styles.categoryChip}>
              {item.category}
            </Chip>
          )}
        </View>
      </View>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={surveys}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={
          loading && !refreshing ? (
            <ActivityIndicator style={styles.loader} />
          ) : null
        }
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title style={styles.modalTitle}>Tạo khảo sát mới</Title>
          
          <TextInput
            label="Tiêu đề"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            style={styles.input}
            mode="outlined"
          />
          
          <TextInput
            label="Mô tả"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
          />
          
          <TextInput
            label="Ngày bắt đầu"
            value={formData.start_date}
            onChangeText={(text) => setFormData({ ...formData, start_date: text })}
            style={styles.input}
            mode="outlined"
          />
          
          <TextInput
            label="Ngày kết thúc"
            value={formData.end_date}
            onChangeText={(text) => setFormData({ ...formData, end_date: text })}
            style={styles.input}
            mode="outlined"
          />

          <Title style={styles.sectionTitle}>Câu hỏi</Title>

          {formData.questions.map((question, questionIndex) => (
            <Surface key={questionIndex} style={styles.questionCard} elevation={1}>
              <TextInput
                label={`Câu hỏi ${questionIndex + 1}`}
                value={question.text}
                onChangeText={(text) => handleQuestionChange(questionIndex, 'text', text)}
                style={styles.input}
                mode="outlined"
              />

              {question.options.map((option, optionIndex) => (
                <TextInput
                  key={optionIndex}
                  label={`Lựa chọn ${optionIndex + 1}`}
                  value={option}
                  onChangeText={(text) => handleOptionChange(questionIndex, optionIndex, text)}
                  style={styles.input}
                  mode="outlined"
                />
              ))}

              <Button
                mode="text"
                onPress={() => handleAddOption(questionIndex)}
                style={styles.addButton}
              >
                Thêm lựa chọn
              </Button>
            </Surface>
          ))}

          <Button
            mode="outlined"
            onPress={handleAddQuestion}
            style={styles.addButton}
          >
            Thêm câu hỏi
          </Button>

          <View style={styles.modalActions}>
            <Button 
              mode="outlined" 
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
            >
              Hủy
            </Button>
            <Button 
              mode="contained" 
              onPress={handleSubmit}
              style={styles.modalButton}
              loading={loading}
            >
              Tạo
            </Button>
          </View>
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setModalVisible(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
  },
  surveyCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  surveyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  surveyTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  surveyDates: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  surveyBody: {
    padding: 16,
  },
  surveyDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 16,
  },
  surveyStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    marginRight: 24,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressValue: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 12,
  },
  input: {
    marginBottom: 16,
  },
  questionCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  addButton: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    marginLeft: 8,
  },
  loader: {
    marginVertical: 16,
  },
});

export default SurveyManagementScreen;
