import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, IconButton, Text, Avatar, Surface, ActivityIndicator, Divider } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const ChatScreen = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef();
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef();

  useEffect(() => {
    // Subscribe to chat messages and typing status
    const messageUnsubscribe = chatService.subscribeToChat(user.id, (newMessages) => {
      setMessages(newMessages);
      // Scroll to bottom when new messages arrive
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const typingUnsubscribe = chatService.subscribeToTyping(user.id, (users) => {
      setTypingUsers(users.filter(u => u.id !== user.id));
    });

    // Mark messages as read when chat opens
    chatService.markAllAsRead(user.id);

    return () => {
      messageUnsubscribe();
      typingUnsubscribe();
    };
  }, [user.id]);

  // Handle typing status
  useEffect(() => {
    if (message && !isTyping) {
      setIsTyping(true);
      chatService.setTypingStatus(user.id, true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        chatService.setTypingStatus(user.id, false);
      }
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      setSending(true);
      setError(null);
      const messageData = {
        text: message.trim(),
        userId: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        participants: [user.id, 'admin'],
        timestamp: new Date(),
        read: false
      };

      await chatService.sendMessage(messageData);
      setMessage('');
      setIsTyping(false);
      chatService.setTypingStatus(user.id, false);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = (msg, index) => {
    const isOwnMessage = msg.userId === user.id;

    return (
      <View
        key={msg.id}
        style={[
          styles.messageContainer,
          isSentByMe ? styles.sentMessage : styles.receivedMessage,
          isFirstInGroup && styles.firstInGroup,
          isLastInGroup && styles.lastInGroup
        ]}
      >
        {!isSentByMe && isFirstInGroup && (
          <Avatar.Text
            size={32}
            label="A"
            style={styles.avatar}
            labelStyle={styles.avatarLabel}
          />
        )}
        <Surface
          style={[
            styles.messageBubble,
            isSentByMe ? styles.sentBubble : styles.receivedBubble
          ]}
        >
          {!isSentByMe && isFirstInGroup && (
            <Text style={styles.senderName}>Quản lý</Text>
          )}
          <Text style={[styles.messageText, isSentByMe && styles.sentMessageText]}>
            {msg.text}
          </Text>
          <Text style={[styles.timestamp, isSentByMe && styles.sentTimestamp]}>
            {formatMessageTime(msg.timestamp)}
            {isSentByMe && msg.read && (
              <MaterialCommunityIcons
                name="check-all"
                size={14}
                color="#4CAF50"
                style={styles.readIcon}
              />
            )}
          </Text>
        </Surface>
      </View>
    );
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    return format(timestamp, 'HH:mm, dd/MM/yyyy', { locale: vi });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Load more messages or refresh current messages
      await chatService.loadMoreMessages(user.id);
    } catch (err) {
      setError('Không thể tải tin nhắn. Vui lòng thử lại.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {error && (
        <Surface style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <IconButton icon="close" size={20} onPress={() => setError(null)} />
        </Surface>
      )}

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        onRefresh={onRefresh}
        refreshing={refreshing}
      >
        {messages.map((msg, index) => renderMessage(msg, index))}
      </ScrollView>

      {typingUsers.length > 0 && (
        <View style={styles.typingContainer}>
          <ActivityIndicator size={16} style={styles.typingIndicator} />
          <Text style={styles.typingText}>
            {typingUsers.map(u => u.username).join(', ')} đang nhập...
          </Text>
        </View>
      )}

      <Surface style={styles.inputContainer} elevation={4}>
        <View style={styles.inputRow}>
          <TextInput
            ref={messageInputRef}
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
            right={<TextInput.Affix text={`${message.length}/1000`} />}
          />
          <IconButton
            icon="send"
            size={24}
            mode={message.trim() ? 'contained' : 'outlined'}
            disabled={!message.trim() || sending}
            onPress={sendMessage}
            loading={sending}
            style={styles.sendButton}
          />
        </View>
      </Surface>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    margin: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ffebee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    color: '#d32f2f',
    flex: 1,
    marginRight: 8,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messagesList: {
    paddingBottom: 16,
  },
  messageContainer: {
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  firstInGroup: {
    marginTop: 16,
  },
  lastInGroup: {
    marginBottom: 16,
  },
  avatar: {
    marginRight: 8,
    backgroundColor: '#1976d2',
  },
  avatarLabel: {
    fontSize: 16,
    color: '#fff',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    elevation: 1,
  },
  sentMessage: {
    justifyContent: 'flex-end',
  },
  receivedMessage: {
    justifyContent: 'flex-start',
  },
  sentBubble: {
    backgroundColor: '#2196f3',
    borderTopRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#212121',
  },
  sentMessageText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 11,
    color: '#757575',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  sentTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  readIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    padding: 8,
    backgroundColor: '#fff',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typingIndicator: {
    marginRight: 8,
  },
  typingText: {
    fontSize: 12,
    color: '#666',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  sendButton: {
    margin: 4,
  },
  errorText: {
    color: '#f44336',
    textAlign: 'center',
    padding: 8,
    backgroundColor: '#ffebee',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f5f5f5',
  },
  typingIndicator: {
    marginRight: 8,
  },
  typingText: {
    color: '#666',
    fontSize: 12,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  readStatus: {
    marginLeft: 4,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    elevation: 1,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2196F3',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
  },
  username: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#666',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  timestamp: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    maxHeight: 100,
  },
});

export default ChatScreen;
