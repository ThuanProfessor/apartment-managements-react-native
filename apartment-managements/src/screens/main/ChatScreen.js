import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, IconButton, Text, Avatar, Surface, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ChatScreen = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef();
  const typingTimeoutRef = useRef(null);

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
      <Surface
        key={msg.id || index}
        style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        {!isOwnMessage && (
          <Text style={styles.username}>
            {msg.isAdmin ? 'Management' : msg.username}
          </Text>
        )}
        <Text style={styles.messageText}>{msg.text}</Text>
        <View style={styles.messageFooter}>
          <Text style={styles.timestamp}>
            {msg.timestamp?.toDate().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          {isOwnMessage && (
            <MaterialCommunityIcons
              name={msg.read ? 'check-all' : 'check'}
              size={16}
              color={msg.read ? '#2196F3' : '#999'}
              style={styles.readStatus}
            />
          )}
        </View>
      </Surface>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.map((msg, index) => renderMessage(msg, index))}
      </ScrollView>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {typingUsers.length > 0 && (
        <View style={styles.typingContainer}>
          <ActivityIndicator size={20} style={styles.typingIndicator} />
          <Text style={styles.typingText}>
            {typingUsers.map(u => u.username).join(', ')} 
            {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          style={styles.input}
          multiline
          maxLength={500}
          disabled={sending}
        />
        <IconButton
          icon="send"
          size={24}
          onPress={sendMessage}
          disabled={!message.trim() || sending}
          loading={sending}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
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
